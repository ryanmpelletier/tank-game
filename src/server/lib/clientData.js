/**
 * This class made for the sake of modularity. Simply stores data for a particular connected client.
 * 
 * In order to protect our game from malicious user input, anything coming from the client will be stored on
 * the "player" nested object. As of right now this will include user input and the screen height and width of the client.
 * Other values as calculated by the server will be stored outside of the "player" nested object.
 */
var Tank = require('./tank');

class ClientData {
    constructor(id, startPosition) {

        //stuff the client gives us
        this.player = {
          type: undefined,
          screenWidth: undefined,
          screenHeight: undefined,
          userInput:{
            keysPressed:{}
          }
        };

        //stuff the client does NOT give us or ever set, this is read by the server for game logic/managing
        this.id = id;
        this.ping = undefined;
        this.startPingTime = undefined;
        this._position = startPosition;

        this._screenName = undefined;

        this.lastHeartbeat = new Date().getTime();

        //should probably make a setter for x and y which also changes the tank's x and y
        this.tank = new Tank(this.id, this.position.x, this.position.y);
    }

    set position (position) {
        //set tank position also
        this.tank.x = position.x;
        this.tank.y = position.y;
        this._position = position;
    }

    get position() {
        return this._position;
    }

    set screenName(screenName) {
        this._screenName = screenName;
        this.tank.screenName = screenName;
    }

    get screenName() {
        return this._screenName;
    }

}

module.exports = ClientData;
