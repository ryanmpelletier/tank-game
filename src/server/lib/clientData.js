/**
 * This class made for the sake of modularity. Simply stores data for a particular connected client.
 * 
 * In order to protect our game from malicious user input, anything coming from the client will be stored on
 * the "player" nested object. As of right now this will include user input and the screen height and width of the client.
 * Other values as calculated by the server will be stored outside of the "player" nested object.
 */
var config = require('../../../config.json');

class ClientData {
  constructor(id, startXPosition, startYPosition) {
    //stuff the client gives us
    this.player = {
      screenName: undefined,
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
    this.position = {
      x: startXPosition,
      y: startYPosition
    };
    this.lastHeartbeat = new Date().getTime();
  }

}

module.exports = ClientData;