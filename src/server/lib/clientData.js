/**
 * This class made for the sake of modularity. Simply stores data for a particular connected client.
 * 
 * In order to protect our game from malicious user input, anything coming from the client will be stored on
 * the "player" nested object. As of right now this will include user input and the screen height and width of the client.
 * Other values as calculated by the server will be stored outside of the "player" nested object.
 */
var config = require('../../../config.json');
var Tank = require('./tank');

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

    this.tank = new Tank(this);

    /**
     * simple quadtree requires a basic format for object put onto the quadtree, I am trying to figure out the best way to mitigate this
     * I don't like a libary enforcing my object to have a certain structure, this is something I am not used to. In Java this would just be
     * an interface I would implement, and I wouldn't have to change the internal representation of my object, this is my compromise
     */
    this.forQuadtree = function(){
      return {
        x: this.position.x,
        y: this.position.y,
        w: 0,
        h: 0,
        id: this.id,
        type:'CLIENT_DATA',
        object: this
      }
    };
  }

}

module.exports = ClientData;