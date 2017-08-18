/**
 * Note that this is client code, but it still uses require! Webpack lets us do that, because it sees the
 * dependencies and wires it all together when it builds our single client JS file.
 */
var global = require('./global');
var Canvas = require('./canvas');
var DrawingUtil = require('./drawingUtil');
var socketIoClient = require('socket.io-client');
var socket;

var clientGameObjects = {};

var canvasGameBoard;
var drawingUtil;

var requestedFrame;


window.addEventListener('resize', resize);

window.onload = function(){
    setupStartScreen();
};
// I would like this to dynamically add the page with the form, and basically initialize a clean slate and new socket connection.
// basically if this method is called the user starts fresh
function setupStartScreen(){

    //add the start screen menu to the page
    //set up socket
    var xhr= new XMLHttpRequest();
    xhr.open('GET', 'html/start_screen.html', true);
    xhr.onreadystatechange= function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return;

        var node = document.createElement('div');
        node.innerHTML = this.responseText;
        document.body.appendChild(node);
        socket = socketIoClient();
        setupSocket(socket);
        document.getElementById("goButton").onclick = beginGame;
    };
    xhr.send();
}

function beginGame(){
    //socket says it is ready to start playing.
    socket.emit('init', document.getElementById("screenNameInput").value);

    //remove the screenname form from the page
    var screenNameForm = document.getElementById("screenNameForm");
    screenNameForm.parentNode.removeChild(screenNameForm);

    canvasGameBoard = new Canvas();
    drawingUtil = new DrawingUtil(canvasGameBoard.getCanvas());

    setTimeout(function(){
        startGame();
    }, 1000);
}
/**
 * Basically this funciton lets us set up some global properties before the animation loop begins,
 * and will likely also be where we do some last minute (millisecond) checking to make sure we are good to go
 */
function startGame(){
    animationLoop();
}

function animationLoop(){
    requestedFrame = window.requestAnimationFrame(animationLoop);
    updateClientView();
}

/**
 * Here is where all the game objects are drawn,
 * it is important to start by clearing the canvas here first.
 */
function updateClientView(){
    //clear canvas
    canvasGameBoard.clear();

    /**
     * Trying to enforce the server sending a perspective object over
     */
    if(typeof clientGameObjects.perspective != 'undefined'){
        drawingUtil.setPerspective(clientGameObjects.perspective.x, clientGameObjects.perspective.y);
    }else{
        throw new Error("unable to find perspective, make sure server is sending perspective object with x and y");
    }
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
    socket.on('welcome',function(clientInitData, gameConfig){
        /**
         * Here the client gets a chance to add any data that the server will need to
         * know in order to correctly computer game logic, such as the client's viewbox
         */
        clientInitData.player.screenHeight = global.screenHeight;
        clientInitData.player.screenWidth = global.screenWidth;

        global.gameWidth = gameConfig.gameWidth;
        global.gameHeight = gameConfig.gameHeight;

        socket.emit('welcome_received', clientInitData);
    });

    /**
     * Server kicked me, closing my socket
     */
    socket.on('kick',function(data){
        socket.close();
    });

    //server needs to draw what gets put into gameObjects
    socket.on('game_objects_update', function(gameObjects){
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
        //setup start screen
        setTimeout(setupStartScreen, 1000);
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

