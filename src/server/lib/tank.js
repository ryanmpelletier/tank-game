/**
 * This class made for the sake of modularity. Simply stores data for a particular connected client.
 * 
 * In order to protect our game from malicious user input, anything coming from the client will be stored on
 * the "player" nested object. As of right now this will include user input and the screen height and width of the client.
 * Other values as calculated by the server will be stored outside of the "player" nested object.
 */
var config = require('../../../config.json');

class Tank {
  constructor(owner = undefined, gunAngle = 0, ammo = config.tankAmmoCapacity) {

    this.owner = owner;
    this.gunAngle = gunAngle;
    this.ammo = ammo;

    //probably will have a bullet class
    this.bullets = [];

    /**
     * simple quadtree requires a basic format for object put onto the quadtree, I am trying to figure out the best way to mitigate this
     * I don't like a libary enforcing my object to have a certain structure, this is something I am not used to. In Java this would just be
     * an interface I would implement, and I wouldn't have to change the internal representation of my object, this is my compromise
     */
    this.forQuadtree = function(){
        return {
            x: this.owner.position.x,
            y: this.owner.position.y,
            w: config.tankWidth,
            h: config.tankHeight,
            id: this.owner.id,
            type:'TANK',
            object: this
        }
    };
  }
}

module.exports = Tank;