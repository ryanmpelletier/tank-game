/**
 * 1. BASIC SERVER SETUP
 * First set up everything necessary for serving up the index.html page
 * with its static assets
 */

'use strict';

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
var QuadtreeManager = require('./lib/quadtreeManager');
var Bullet = require('./lib/bullet');
var Direction = require('./lib/direction');
var Wall = require('./lib/wall');

/**
 * Quadtree will hold all of the objects in the game that will need to be kept track of
 */
var quadtreeManager = new QuadtreeManager();
var quadtree = quadtreeManager.getQuadtree();

/**
 * Initialize border walls, put them in the quadtree
 * I'm still not sure I want to use the quadtree to store data for the borders.
 * I don't know how much it will help us, it might even not help. 
 */
var leftBorderWall = new Wall(0, 0, config.wallWidth, config.gameHeight + config.wallWidth);
var topBorderWall = new Wall(config.wallWidth, 0, config.gameWidth - config.wallWidth, config.wallWidth);
var rightBorderWall = new Wall(config.gameWidth - config.wallWidth, 0, config.wallWidth, config.gameHeight);
var bottomBorderWall = new Wall(config.wallWidth, config.gameHeight, config.gameWidth - config.wallWidth, config.wallWidth);

quadtree.put(leftBorderWall.forQuadtree());
quadtree.put(topBorderWall.forQuadtree());
quadtree.put(rightBorderWall.forQuadtree());
quadtree.put(bottomBorderWall.forQuadtree());



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
socketIo.on('connection', function(socket) {
    console.log(`[LOG] user connected with socket id ${socket.id}`);

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
    socket.on('init',function() {
        socket.emit('welcome', currentClientData, {gameWidth: config.gameWidth, gameHeight: config.gameHeight});
    });

    /**
    * Client broadcasts this event after they have received the welcome event from the server
    * They send back some information the server needs to properly manage this user
    */
    socket.on('welcome_received', function(clientUpdatedData) {
        //copy over player nested object to clientData reference for this socket
        currentClientData.player = clientUpdatedData.player;

        //add references for the clientData and for the socket
        currentClientDatas.push(currentClientData);
        sockets[clientUpdatedData.id] = socket;

        //put client onto quadtree
        quadtree.put(currentClientData.forQuadtree());
    });

    /**
    * Client responded to pingcheck event,
    * calculate how long it took
    */
    socket.on('pongcheck',function() {
        currentClientData.ping = new Date().getTime() - currentClientData.startPingTime;
    });


    /**
    * When client calls socket.disconnect() on their end, this event is automatically fired
    */
    socket.on('disconnect',function() {
        var playerIndex = util.findIndex(currentClientDatas,currentClientData.id);
        if(playerIndex > -1) {
            currentClientDatas.splice(playerIndex,1);
            console.log(`[INFO] Player ${currentClientData.player.screenName} has been removed from tracked players.`);
        }
        //remove player from quadtree
        quadtree.remove(currentClientData.forQuadtree(), 'id');
    });

    /**
    * 2.2 GAME RELATED SOCKET EVENTS
    */

    /**
    * This is likely where client will send their movement input
    * This is called at least once each time the client redraws the frame
    */
    socket.on('client_checkin',function(clientCheckinData) {
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
var checkPing = function() {
    currentClientDatas.forEach(function(clientData) {
        currentClientDatas[util.findIndex(currentClientDatas,clientData.id)].startPingTime = new Date().getTime();
        sockets[clientData.id].emit('pingcheck');
    })
};


/**
 * gameTick is called once per player on each gameObjectUpdater call  
 */
var gameTick = function(clientData) {

    //lets just calculate the current time once, should be close enough to actual and will be more efficient
    var currentTime = new Date().getTime();

    if(clientData.lastHeartbeat < currentTime - config.maxLastHeartBeat) {
        console.log(`[INFO] Kicking player ${clientData.player.screenName}`);
        sockets[clientData.id].emit('kick');
        sockets[clientData.id].disconnect();
    }


    /**
     * Increase ammo if necessary
     */
    if(clientData.tank.ammo < config.tankAmmoCapacity && ((currentTime - clientData.tank.lastAmmoEarned > config.tankTimeToGainAmmo) || typeof clientData.tank.lastAmmoEarned == 'undefined')){
        clientData.tank.ammo = clientData.tank.ammo + 1;
        clientData.tank.lastAmmoEarned = currentTime;
    }

    /**
    * Fire bullets if necessary
    */
    if(typeof clientData.player.userInput.mouseClicked != 'undefined') {
        if(clientData.player.userInput.mouseClicked &&
            clientData.tank.ammo > 0 &&
            (typeof clientData.tank.lastFireTime == 'undefined' ||
            (currentTime - clientData.tank.lastFireTime > config.tankFireTimeWait))) {

            clientData.tank.lastFireTime = currentTime;
            clientData.tank.ammo = clientData.tank.ammo - 1;

            var xComponent = Math.cos(clientData.tank.gunAngle);
            var yComponent = Math.sin(clientData.tank.gunAngle);


            var bullet = new Bullet(clientData.id, clientData.tank.x + (xComponent * config.tankBarrelLength), clientData.tank.y - (yComponent * config.tankBarrelLength),
                xComponent * config.bulletVelocity,
                yComponent * config.bulletVelocity);

            quadtree.put(bullet.forQuadtree());
            clientData.tank.bullets.push(bullet);
        }
    }

    /**
    * simpleQuadtree requires that the x,y,w, and h used to put the item be used to retrieve it
    * here we get the old quadtree information
    */
    var oldQuadreeInfo = clientData.forQuadtree();
    var oldPosition = clientData.position;
    var newPosition = {
        x: clientData.position.x,
        y: clientData.position.y
    };

    // Update player position based on input

    // Check if user's position should move UP
    if(clientData.player.userInput.keysPressed['KEY_UP'] &&
        !clientData.player.userInput.keysPressed['KEY_DOWN']) {
        newPosition.y = oldPosition.y - config.player.speedFactor;
    }
    // Check if user's position should move DOWN
    else if(clientData.player.userInput.keysPressed['KEY_DOWN'] &&
        !clientData.player.userInput.keysPressed['KEY_UP']) {
        newPosition.y = oldPosition.y + config.player.speedFactor;
    }

    // Check if user's position should move RIGHT
    if(clientData.player.userInput.keysPressed['KEY_RIGHT'] &&
        !clientData.player.userInput.keysPressed['KEY_LEFT']) {
        newPosition.x = oldPosition.x + config.player.speedFactor;
    }
    // Check if user's position should move LEFT
    else if(clientData.player.userInput.keysPressed['KEY_LEFT'] &&
        !clientData.player.userInput.keysPressed['KEY_RIGHT']) {
        newPosition.x = oldPosition.x - config.player.speedFactor;
    }

    // Check if tank has moved since last update
    // (Necessary to check because otherwise tank's direction will keep going
    // back to North every time that it stops moving)
    if(!util.areCoordinatesEqual(oldPosition, newPosition)) {
        // Tank has moved so update its direction
        var angleInRadians = Math.atan2(newPosition.y - oldPosition.y, newPosition.x - oldPosition.x);
        var angleInDeg = ((angleInRadians * 180 / Math.PI) + 360) % 360;
        clientData.tank.hullDirection = angleInDeg;

        // Update that tank is moving (so animation will start)
        clientData.tank.isMoving = true;
    }
    else {
        // Update that tank is NOT moving (so animation will stop)
        clientData.tank.isMoving = false;
    }

    clientData.position = newPosition;

    if(typeof clientData.player.userInput.mouseAngle != 'undefined'){
        clientData.tank.gunAngle = clientData.player.userInput.mouseAngle;
    }

    /**
    * Update the item on the quadtree
    */
    quadtree.update(oldQuadreeInfo, 'id', clientData.forQuadtree());

    /**
    * Update positions of all the bullets
    */
    for(let i = 0; i < clientData.tank.bullets.length; i++) {
        let oldTreeInfo = clientData.tank.bullets[i].forQuadtree();
        clientData.tank.bullets[i].x = clientData.tank.bullets[i].x + clientData.tank.bullets[i].velocityX;
        clientData.tank.bullets[i].y = clientData.tank.bullets[i].y - clientData.tank.bullets[i].velocityY;
        quadtree.update(oldTreeInfo, 'id', clientData.tank.bullets[i].forQuadtree());
    }

    /**
     * Remove any bullets that are now out of bounds.
     */
    for(var bullet of clientData.tank.bullets) {
        if(bullet.x > config.gameWidth || bullet.x < 0 || bullet.y > config.gameHeight || bullet.y < 0){
            var playerIndex = util.findIndex(currentClientDatas,bullet.ownerId);
            if(playerIndex > -1) {
                var bulletIndex = util.findIndex(currentClientDatas[playerIndex].tank.bullets, bullet.id);
                currentClientDatas[playerIndex].tank.bullets.splice(bullet.id,1);
                quadtree.remove(bullet.forQuadtree(), 'id');
            }
        }
    }

    /**
     * Check any collisions on tank
     */
    quadtree.get(clientData.tank.forQuadtree(),function(objectInTankArea){
        if(objectInTankArea.type === 'BULLET'){
            var bullet = objectInTankArea.object;
            var playerIndex = util.findIndex(currentClientDatas,bullet.ownerId);
            if(playerIndex > -1) {
                var bulletIndex = util.findIndex(currentClientDatas[playerIndex].tank.bullets, bullet.id);
                currentClientDatas[playerIndex].tank.bullets.splice(bullet.id,1);
                quadtree.remove(bullet.forQuadtree(), 'id');
            }
        }
        return true;
    });

};


/**
 * Iterate through players and update their game objects,
 * this will include putting each currentClientData on the quadtree
 */
var gameObjectUpdater = function() {
    //Iterate backwards, players may be removed from the array as the iteration occurs
    for (let i = currentClientDatas.length - 1; i >= 0; --i) {
        gameTick(currentClientDatas[i]);
    }
};

/**
 * For each player send the game objects that are visible to them.
 */
var clientUpdater = function() {
    currentClientDatas.forEach(function(clientData) {
        /**
        * Query quadtree using players current position and their screenwidth
        * QuadtreeManager will return everything the client needs in order to draw the game objects
        */
        var queryArea = {
            x: clientData.position.x - clientData.player.screenWidth/2,
            y: clientData.position.y - clientData.player.screenHeight/2,
            w: clientData.player.screenWidth,
            h: clientData.player.screenHeight
        };

        sockets[clientData.id].emit('game_objects_update', quadtreeManager.queryGameObjects(queryArea));
    });
};


/**
 * Server loops (I'm not sure what the optimal timeout is for these callbacks)
 */

//update all the game objects
setInterval(gameObjectUpdater, 1000/60);

//push out data to clients
setInterval(clientUpdater, 1000/40);