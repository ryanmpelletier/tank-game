/**
 * This class made for the sake of modularity. Simply stores data for a particular connected client.
 * 
 * In order to protect our game from malicious user input, anything coming from the client will be stored on
 * the "player" nested object. As of right now this will include user input and the screen height and width of the client.
 * Other values as calculated by the server will be stored outside of the "player" nested object.
 */
var Tank = require('./tank');

class ClientData {
  constructor(id, startXPosition, startYPosition) {
    //stuff the client gives us
    this.player = {
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
    this._position = {
      x: startXPosition,
      y: startYPosition
    };

    this._screenName = undefined;
    
    this.lastHeartbeat = new Date().getTime();

    //should probably make a setter for x and y which also changes the tank's x and y
    this.tank = new Tank(this.id, this.position.x, this.position.y);
    /**
     * simple quadtree requires a basic format for object put onto the quadtree, I am trying to figure out the best way to mitigate this
     * I don't like a libary enforcing my object to have a certain structure, this is something I am not used to. In Java this would just be
     * an interface I would implement, and I wouldn't have to change the internal representation of my object, this is my compromise
     */
    this.forQuadtree = function(){
        return this.tank.forQuadtree();
    };
  }

  set position(position){
    //set tank position also
    this.tank.x = position.x;
    this.tank.y = position.y;
    this.tank.addLocation({x: position.x, y: position.y});
    this._position = position;
  }

  get position(){
    return this._position;
  }

  set screenName(screenName){
    this._screenName = screenName;
    this.tank.screenName = screenName;
  }

  get screenName(){
    return this._screenName;
  }

}

module.exports = ClientData;