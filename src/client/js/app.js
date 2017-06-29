/**
 * Note that this is client code, but it still uses require! Webpack lets us do that, because it sees the
 * dependencies and wires it all together when it builds our single client JS file.
 */

var Greeter = require('./greeter');
var socketIoClient = require('socket.io-client');
var socket;
var clientGameObjects = {};

window.onload = function(){
    var greeter = new Greeter();
    socket = socketIoClient();

    //set up socket to respond to server sockets
    setupSocket(socket);


    //we actually start the client game loop before emitting init to the server, every time the game loop runs on our end it sends a heartbeat signal to the server
    //this is important, the server will use heartbeats to know when to kill connections that are no longer active (and remove the corresponding user)
    animationLoop();


    //socket says it is ready to start playing (I'm not exactly sure what this means, what does the client need to do to say it is ready?)
    socket.emit('init');
};

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
     * 
     */
    socket.on('welcome',function(clientInitData){
        console.log("Welcome Data Recieved:", clientInitData);
        clientInitData.player.screenName = "test" + new Date().getTime();
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
     * In here it will be helpful to 
     */
    socket.on('kick',function(data){
        socket.close();
    });

    //server needs to draw what gets put into gameObjects
    socket.on('client_update',function(gameObjects){
        clientGameObjects = gameObjects;
        socket.emit('client_checkin',{"test":"nothing"});
    });


}