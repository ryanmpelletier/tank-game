/**
 * Note that this is client code, but it still uses require! Webpack lets us do that, because it sees the
 * dependencies and wires it all together when it builds our single client JS file.
 */
var global = require('./global');
var socketIoClient = require('socket.io-client');
var socket;
var clientGameObjects = {};


window.addEventListener('resize', resize);

window.onload = function(){
    socket = socketIoClient();

    //set up socket to respond to server sockets
    setupSocket(socket);


    //we actually start the client game loop before emitting init to the server, every time the game loop runs on our end it sends a heartbeat signal to the server
    //this is important, the server will use heartbeats to know when to kill connections that are no longer active (and remove the corresponding user)
    startGame();


    //socket says it is ready to start playing (I'm not exactly sure what this means, what does the client need to do to say it is ready?)
    socket.emit('init');
};

/**
 * Basically this funciton lets us set up some global properties before the animation loop begins,
 * and will likely also be where we do some last minute (millisecond) checking to make sure we are good to go
 */
function startGame(){
    global.screenHeight = window.innerHeight;
    global.screenWidth = window.innerWidth;
    animationLoop();
}

function animationLoop(){
    console.log("animationLoop");
    window.requestAnimationFrame(animationLoop);
    updateClientView();
}

function updateClientView(){
    //draw the gameObjects
    document.getElementById('test_data').innerText = clientGameObjects['server_time'];
}


/**
 * Here is where we set up configuration for our socket.
 * So basically we give the socket all the callbacks for the different events it might receive.
 * 
 */
function setupSocket(socket){
    /**
     * 
     * Server will send a welcome event with data the player needs to initialize itself
     * The purpose of the event is to acknowledge that a user has joined
     * Client will respond when it is ready to play the game, user will check
     * I need to be careful here what I let the client change! I should only be getting back data from the client that I need to show them the full game, not stuff like socket id's or heartbeat times
     * 
     */
    socket.on('welcome',function(clientInitData){
        console.log("Welcome Data Recieved:", clientInitData);
        clientInitData.player.screenName = "test" + new Date().getTime();
        clientInitData.player.screenHeight = global.screenHeight;
        clientInitData.player.screenWidth = global.screenWidth;
        /**
         * get clientInitData and save what I need to,
         * then let the server know I got the data and send them what they need from me
         * this will likely include anything I have added, like a screen name
         * also this will include stuff like my screen height and width (server needs this information to know what objects I can see)
         */


        socket.emit('welcome_recieved', clientInitData);
    });

    /**
     * Server kicked me, closing my socket
     */
    socket.on('kick',function(data){
        socket.close();
    });

    //server needs to draw what gets put into gameObjects
    socket.on('game_objects_update',function(gameObjects){
        clientGameObjects = gameObjects;
        //I think it would be nice here to basically send the server back a clientData object, I think the client should have one of those
        socket.emit('client_checkin',{"test":"nothing"});
    });

    /**
     * Check how long the communication between client
     * and server was.
     */
    socket.on('pongcheck',function(){
        global.latency = new Date().getTime() - global.startPingTime;
    });
}

/**
 * Check latency, store current time then on server
 * 'pongcheck' event record time difference.
 */
function checkLatency() {
    global.startPingTime = Date.now();
    socket.emit('pingcheck');
}

/**
 * Store global screen dimensions, then send them to the server.
 * This function is bound to the browser's 'resize' event.
 */
function resize(){
    global.screenWidth = window.innerWidth;
    global.screenHeight = window.innerHeight;
    socket.emit('windowResized',{screenWidth: global.screenWidth, screenHeight: global.screenHeight});
}

