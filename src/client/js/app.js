/**
 * Note that this is client code, but it still uses require! Webpack lets us do that, because it sees the
 * dependencies and wires it all together when it builds our single client JS file.
 */
var global = require('./global');
var Canvas = require('./canvas');
var DrawingUtil = require('./drawingUtil');
var socketIoClient = require('socket.io-client');
var socket;

/**
 * Here is the data for the objects which need to be drawn.
 * The DrawingUtil class will abstract away the drawing process,
 * so we can keep our drawing code out of this file.
 * 
 * The server will send an object which nested objects for each type of object to be drawn.
 * An example follows.
 * 
 * var clientGameObjects = {
    "player":{},
    "tanks": {},
    "bullets":{},
    "barriers":{},
    "time":{},
    };
 * 
 * 
 */
var clientGameObjects = {};

var canvasGameBoard;
var drawingUtil;


window.addEventListener('resize', resize);

window.onload = function(){
    socket = socketIoClient();

    //set up socket to respond to server socket events
    setupSocket(socket);

    //socket says it is ready to start playing.
    socket.emit('init');
    startGame();
};

/**
 * Basically this funciton lets us set up some global properties before the animation loop begins,
 * and will likely also be where we do some last minute (millisecond) checking to make sure we are good to go
 */
function startGame(){
    canvasGameBoard = new Canvas();
    drawingUtil = new DrawingUtil(canvasGameBoard.getCanvas());
    animationLoop();
}

function animationLoop(){
    window.requestAnimationFrame(animationLoop);
    updateClientView();
}

/**
 * Here is where all the game objects are drawn,
 * it is important to start by clearing the canvas here first.
 */
function updateClientView(){
    //clear canvas
    canvasGameBoard.clear();
    drawingUtil.drawGameObjects(clientGameObjects);
}


/**
 * Here is where we set up the callbacks for our socket.
 * So basically we give the socket all the callbacks for the different events it might receive.
 * 
 */
function setupSocket(socket){
    /**
     * 
     * Server will send a welcome event with data the player needs to initialize itself
     * The purpose of the event is to acknowledge that a user has joined
     * Client will respond when it is ready to play the game
     * 
     */
    socket.on('welcome',function(clientInitData){
        /**
         * Here the client gets a chance to add any data that the server will need to
         * know in order to correctly computer game logic, such as the client's viewbox
         */
        clientInitData.player.screenName = "test" + new Date().getTime();
        clientInitData.player.screenHeight = global.screenHeight;
        clientInitData.player.screenWidth = global.screenWidth;


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
        socket.emit('client_checkin', canvasGameBoard.getUserInput());
    });

    /**
     * Server wants to calculate my ping, 
     * emit back to server right away.
     */
    socket.on('pingcheck',function(){
        socket.emit('pongcheck');
    });

}

/**
 * Store global screen dimensions, then send them to the server.
 * This function is bound to the browser's 'resize' event.
 */
function resize(){
    global.screenWidth = window.innerWidth;
    global.screenHeight = window.innerHeight;
    canvasGameBoard.setHeight(global.screenHeight);
    canvasGameBoard.setWidth(global.screenWidth);
    socket.emit('windowResized',{screenWidth: global.screenWidth, screenHeight: global.screenHeight});
}

