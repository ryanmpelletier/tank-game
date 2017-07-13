/**
 * 1. BASIC SERVER SETUP
 * First set up everything necessary for serving up the index.html page
 * with its static assets
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var socketIo = require('socket.io')(http);
var path = require('path');

// Import application config
var config = require('../../config.json');

//for allowing page to access static resources, in our index.html we can use /js for all our javascript files.
app.use('/js',express.static(path.join(__dirname, '../client/js')));
app.use('/css',express.static(path.join(__dirname, '../client/css')));
app.use('/img',express.static(path.join(__dirname, '../client/img')));

/**
 * Serve index.html when the user visits the site in their browser
 */
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname,'/../client/index.html'));
});

/**
 * Start listening, I'm not sure how the details of this are working
 */
http.listen(config.port, function(){
  console.log('listening on port:' + config.port);
});


/**
 * 2. GAME VARIABLES
 */

//import game related classes
var ClientData = require('./lib/clientData');
var util = require('./lib/util');
var SimpleQuadtree = require('simple-quadtree');

var quadtree = new SimpleQuadtree(0, 0, config.gameWidth, config.gameHeight);



/**
 * currentClientDatas stores references to the currentClientData objects which are inside of the on('connection') handler,
 * this is for accessing clientData outside of the context of a socket event
 */
var currentClientDatas = [];
var sockets = {};

/**
 * 2. SOCKET CONNECTION CALLBACKS
 */

/**
 *  Here is where we attach the event handlers for the socket
 * 
 * NOTE: inside the scope of this function, currentClientData will refer to 
 * the client who is responsible for sending the socket event the server, meaning socket.id and currentClientData.id should be the same,
 * when accessing currentClientData from outside the context of a socket event from that client (like in the gameObjectUpdater loop),
 * use the currentClientDatas array and index it by a socket id number
 */
socketIo.on('connection', function(socket){
  console.log('[LOG] user connected with socket id', socket.id);

  /**
   * Here is where I need to perform any server-side logic to set up state for the newly connecting player.
   * For example: calculate players starting position, get their ID, etc.
   */
  var currentClientData = new ClientData(socket.id, config.gameWidth/2, config.gameHeight/2);


  /**
   * 2.1 "HANDSHAKE"/MANAGEMENT RELATED SOCKET EVENTS
   */

  /**
   * Client broadcasts this init event after it has set up its socket to respond to
   * events from the server socket.
   */
  socket.on('init',function(){
    socket.emit('welcome',currentClientData, {gameWidth: config.gameWidth, gameHeight: config.gameHeight});
  });

  /**
   * Client broadcasts this event after they have received the welcome event from the server
   * They send back some information the server needs to properly manage this user
   */
  socket.on('welcome_recieved', function(clientUpdatedData){
      //copy over player nested object to clientData reference for this socket
      currentClientData.player = clientUpdatedData.player;

      //add references for the clientData and for the socket 
      currentClientDatas.push(currentClientData); 
      quadtree.put(currentClientData.forQuadtree());
      sockets[clientUpdatedData.id] = socket;
  });

   /**
   * Client responded to pingcheck event,
   * calculate how long it took
   */
  socket.on('pongcheck',function(){
      currentClientData.ping = new Date().getTime() - currentClientData.startPingTime;
  });


  /**
   * When client calls socket.disconnect() on their end, this event is automatically fired
   */
  socket.on('disconnect',function(){
    var playerIndex = util.findIndex(currentClientDatas,currentClientData.id);
    if(playerIndex > -1){
      currentClientDatas.splice(playerIndex,1);
      console.log("[INFO] Player " + currentClientData.player.screenName + " has been removed from tracked players.");
    }
    //remove player from quadtree, eventually, this should probably remove all the owned objects from the quadtree
    quadtree.remove(currentClientData.forQuadtree(), 'id');
  });

  /**
   * 2.2 GAME RELATED SOCKET EVENTS
   */

  /**
   * This is likely where client will send their movement input
   * This is called at least once each time the client redraws the frame
   */
  socket.on('client_checkin',function(clientCheckinData){
        currentClientData.player.userInput = clientCheckinData;
        currentClientData.lastHeartbeat = new Date().getTime();
  });

  socket.on('windowResized', function (data) {
      currentClientData.player.screenWidth = data.screenWidth;
      currentClientData.player.screenHeight = data.screenHeight;
  });

});


  /**
   * 3.0 GAME RELATED FUNCTIONS AND LOOPS
   */

/**
 * Check the ping for all connected clients
 */
var checkPing = function(){
  currentClientDatas.forEach(function(clientData){
    currentClientDatas[util.findIndex(currentClientDatas,clientData.id)].startPingTime = new Date().getTime();
    sockets[clientData.id].emit('pingcheck');
  })
}


/**
 * gameTick is called once per player on each gameObjectUpdater call  
 */
var gameTick = function(clientData){
  if(clientData.lastHeartbeat < new Date().getTime() - config.maxLastHeartBeat){
      console.log("[INFO] Kicking player " + clientData.player.screenName);
      sockets[clientData.id].emit('kick');
      sockets[clientData.id].disconnect();
  }
  var oldQuadreeInfo = clientData.forQuadtree(); 

  //update player position based on input
  if(clientData.player.userInput.keysPressed['KEY_UP'] && !clientData.player.userInput.keysPressed['KEY_DOWN']){
      clientData.position.y = clientData.position.y - config.player.speedFactor; 
  }else if(clientData.player.userInput.keysPressed['KEY_DOWN'] && !clientData.player.userInput.keysPressed['KEY_UP']){
      clientData.position.y = clientData.position.y + config.player.speedFactor; 
  }

  if(clientData.player.userInput.keysPressed['KEY_RIGHT'] && !clientData.player.userInput.keysPressed['KEY_LEFT']){
      clientData.position.x = clientData.position.x + config.player.speedFactor; 
  }else if(clientData.player.userInput.keysPressed['KEY_LEFT'] && !clientData.player.userInput.keysPressed['KEY_RIGHT']){
      clientData.position.x = clientData.position.x - config.player.speedFactor; 
  }

  quadtree.update(oldQuadreeInfo, 'id', clientData.forQuadtree());
}


/**
 * Iterate through players and update their game objects,
 * this will include putting each currentClientData on the quadtree
 */
var gameObjectUpdater = function(){
  //Iterate backwards, players may be removed from the array as the iteration occurs
  for (var i = currentClientDatas.length - 1; i >= 0; --i) {
      gameTick(currentClientDatas[i]);
  }
}

/**
 * For each player send the game objects that are visible to them.
 */
var clientUpdater = function(){
  currentClientDatas.forEach(function(clientData){

      /**
      * visible players are players that are within the screen of the current player
      * use quadtree for efficiency
      */
      var visiblePlayers = [];

      /**
       * query quadtree using players current position and their screenwidth, get all objects within
       */
      var queryData = {x:clientData.position.x - clientData.player.screenWidth/2, y:clientData.position.y - clientData.player.screenHeight/2, w:clientData.player.screenWidth, h:clientData.player.screenHeight};
      quadtree.get(queryData, function(objectToBeSeen){
          visiblePlayers.push({x:objectToBeSeen.x,y:objectToBeSeen.y});
          return true;
      });


      sockets[clientData.id].emit('game_objects_update', {
        "server_time":new Date().getTime(),
        "player":{
          "position":clientData.position
        },
        "players":visiblePlayers
      });
  });
}


/**
 * Server loops (I'm not sure what the optimal timeout is for these callbacks)
 */

//update all the game objects
setInterval(gameObjectUpdater, 1000/60);

//push out data to clients
setInterval(clientUpdater, 1000/40);