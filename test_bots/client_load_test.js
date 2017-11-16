
const numberOfBots = process.argv[2];


var io = require('socket.io-client');
var BotController = require('./botController');

var botControllers = [];


for(var i = 0; i < numberOfBots; i++){
    var socket = io.connect('http://localhost:8080', {reconnect: true});
    botControllers.push(new BotController());
    setupSocket(socket, i);
    socket.emit("init", `bot${i + 1}`);
}

function addBot(index){
    var socket = io.connect('http://localhost:8080', {reconnect: true});
    botControllers[index] = new BotController();
    setupSocket(socket, index);
    socket.emit("init", `bot${index + 1}`);
}

function setupSocket(socket, index) {
    /**
     *
     * Server will send a welcome event with data the player needs to initialize itself
     * The purpose of the event is to acknowledge that a user has joined
     * Client will respond when it is ready to play the game
     *
     */
    socket.on('welcome',function(clientInitData) {
        /**
         * Here the client gets a chance to add any data that the server will need to
         * know in order to correctly computer game logic, such as the client's viewbox
         */
        //

        /**
         * Here the client gets a chance to add any data that the server will need to
         * know in order to correctly computer game logic, such as the client's viewbox
         */
        clientInitData.player.screenHeight = 1200;
        clientInitData.player.screenWidth = 1200;

        socket.emit('welcome_received', clientInitData);
    });

    //server needs to draw what gets put into gameObjects
    socket.on('game_objects_update', function(gameObjects){

        var userInput = botControllers[index].getBotInput();
        socket.emit('client_checkin', userInput);
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
        addBot(index);
    });

}
