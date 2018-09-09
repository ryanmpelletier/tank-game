/**
 * Note that this is client code, but it still uses require! Webpack lets us do that, because it sees the
 * dependencies and wires it all together when it builds our single client JS file.
 */
var global = require('./global');
var Canvas = require('./canvas');
var DrawingUtil = require('./drawingUtil');
var socketIoClient = require('socket.io-client');
var socket;

//doesn't need to be for a variable, this import adds a polyfill Microsoft browsers need
require('babel-polyfill');

var screenNameForm = undefined;

var clientGameObjects = {};

var canvasGameBoard;
var drawingUtil;

var requestedFrame;

var lastClientCheckin = new Date().getTime();

window.addEventListener('resize', resize);

window.onload = function() {
    setupStartScreen();
    loadLeaderboard();
};

/**
 * Loads the leaderboard.html file into the leaderboard <div>.
 * NOTE: Dynamically loading in leaderboard.html to keep the main index.html file easy to read.
 */
function loadLeaderboard() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'html/leaderboard.html', true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return;
        if (this.status !== 200) return;
        document.getElementById("leaderboard").innerHTML = this.responseText;
    };
}

//set up the form where the user can enter their name
function setupStartScreen() {

    //see if we need to get the screenNameForm for the first time
    if(typeof screenNameForm === 'undefined') {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'html/start_screen.html', true);
        xhr.onreadystatechange = function() {
            if (this.readyState !== 4) return;
            if (this.status !== 200) return;

            var node = document.createElement('div');
            node.setAttribute("id", "start-screen-content");
            node.innerHTML = this.responseText;
            document.body.appendChild(node);
            document.getElementById("button-play").onclick = beginGame;
            document.getElementById("button-spectate").onclick = spectate;
        };
        xhr.send();
    } else {
        document.body.appendChild(screenNameForm);
        document.getElementById("button-play").onclick = beginGame;
        document.getElementById("button-spectate").onclick = spectate;
    }
}

//set up the socket and begin talking with the server
function beginGame() {
    socket = socketIoClient();
    setupPlaySocket(socket);
    init();
}

function spectate(){
    socket = socketIoClient();
    setupSpectateSocket(socket);
    init();

}

function init() {

    //socket says it is ready to start playing.
    socket.emit('init', document.getElementById("input-username").value.trim().slice(0, 10));

    //remove the start up form from the page
    screenNameForm = document.getElementById("start-screen-content");
    screenNameForm.parentNode.removeChild(screenNameForm);

    canvasGameBoard = new Canvas();
    drawingUtil = new DrawingUtil(canvasGameBoard.getCanvas());

    document.getElementById("leaderboard").style.display = "block";
    document.getElementById("boost").style.display = "block";

    startGame();
}

/**
 * Basically this funciton lets us set up some global properties before the animation loop begins,
 * and will likely also be where we do some last minute (millisecond) checking to make sure we are good to go
 */
function startGame() {
    animationLoop();
}

function animationLoop() {
    requestedFrame = window.requestAnimationFrame(animationLoop);
    updateClientView();
}

/**
 * Here is where all the game objects are drawn,
 * it is important to start by clearing the canvas here first.
 */
function updateClientView() {
    //clear canvas
    canvasGameBoard.clear();

    /**
     * Trying to enforce the server sending a perspective object over
     */
    if(typeof clientGameObjects.perspective !== 'undefined') {
        drawingUtil.setPerspective(clientGameObjects.perspective.x, clientGameObjects.perspective.y);
        drawingUtil.drawGameObjects(clientGameObjects);
    }else {
        console.log("unable to find perspective, make sure server is sending perspective object with x and y");
    }
}


/**
 * Here is where we set up the callbacks for our socket.
 * So basically we give the socket all the callbacks for the different events it might receive.
 * 
 */
function setupPlaySocket(socket) {
    /**
     * 
     * Server will send a welcome event with data the player needs to initialize itself
     * The purpose of the event is to acknowledge that a user has joined
     * Client will respond when it is ready to play the game
     * 
     */
    socket.on('welcome',function(clientInitData, gameConfig) {
        /**
         * Here the client gets a chance to add any data that the server will need to
         * know in order to correctly computer game logic, such as the client's viewbox
         */
        clientInitData.player.screenHeight = global.screenHeight;
        clientInitData.player.screenWidth = global.screenWidth;
        clientInitData.player.type = 'PLAYER';

        global.gameWidth = gameConfig.gameWidth;
        global.gameHeight = gameConfig.gameHeight;
        global.screenName = clientInitData.tank.screenName;

        socket.emit('welcome_received', clientInitData);
    });

    //server needs to draw what gets put into gameObjects
    socket.on('game_objects_update', function(gameObjects) {
        clientGameObjects = gameObjects;
        if((new Date().getTime() - lastClientCheckin) > global.clientCheckinInterval){
            socket.emit('client_checkin', canvasGameBoard.getUserInput());
            lastClientCheckin = new Date().getTime();
        }
    });

    /**
     * Server wants to calculate my ping, 
     * emit back to server right away.
     */
    socket.on('pingcheck',function() {
        socket.emit('pongcheck');
    });

    /**
     * Tank has been destroyed, socket connection
     */
    socket.on('death',function(){
        //stop animating
        window.cancelAnimationFrame(requestedFrame);
        //clear canvas
        canvasGameBoard.clear();
        //empty the game objects this client is drawing
        clientGameObjects = {};
        //remove leaderboard and boost bar
        document.getElementById("leaderboard").style.display = "none";
        document.getElementById("boost").style.display = "none";
        //setup start screen
        setupStartScreen();
    });

}

function setupSpectateSocket(socket){
    /**
     *
     * Server will send a welcome event with data the player needs to initialize itself
     * The purpose of the event is to acknowledge that a user has joined
     * Client will respond when it is ready to play the game
     *
     */
    socket.on('welcome',function(clientInitData, gameConfig) {
        /**
         * Here the client gets a chance to add any data that the server will need to
         * know in order to correctly computer game logic, such as the client's viewbox
         */
        clientInitData.player.screenHeight = global.screenHeight;
        clientInitData.player.screenWidth = global.screenWidth;
        clientInitData.player.type = 'SPECTATOR';
        global.playerType = 'SPECTATOR';

        global.gameWidth = gameConfig.gameWidth;
        global.gameHeight = gameConfig.gameHeight;
        global.screenName = clientInitData.tank.screenName;

        socket.emit('welcome_received', clientInitData);
    });


    //NOTE: below code is redundant and should be refactored
    //server needs to draw what gets put into gameObjects
    socket.on('game_objects_update', function(gameObjects) {
        clientGameObjects = gameObjects;
        if((new Date().getTime() - lastClientCheckin) > global.clientCheckinInterval){
            socket.emit('client_checkin', canvasGameBoard.getUserInput());
            lastClientCheckin = new Date().getTime();
        }
    });

    /**
     * Server wants to calculate my ping,
     * emit back to server right away.
     */
    socket.on('pingcheck',function() {
        socket.emit('pongcheck');
    });

    /**
     * Tank has been destroyed, socket connection
     */
    socket.on('death',function(){
        //stop animating
        window.cancelAnimationFrame(requestedFrame);
        //clear canvas
        canvasGameBoard.clear();
        //empty the game objects this client is drawing
        clientGameObjects = {};
        //remove leaderboard and boost bar
        document.getElementById("leaderboard").style.display = "none";
        document.getElementById("boost").style.display = "none";
        //setup start screen
        setupStartScreen();
    });
}

/**
 * Store global screen dimensions, then send them to the server.
 * This function is bound to the browser's 'resize' event.
 */
function resize() {
    global.screenWidth = window.innerWidth;
    global.screenHeight = window.innerHeight;
    canvasGameBoard.setHeight(global.screenHeight);
    canvasGameBoard.setWidth(global.screenWidth);
    socket.emit('windowResized',{screenWidth: global.screenWidth, screenHeight: global.screenHeight});
}

