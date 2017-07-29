/**
 * All the game logic happens on the server, this object
 * is responsible for taking an area and giving back the information needed 
 * for the client to draw the objects in that area
 */
var config = require('../../../config.json');
var SimpleQuadtree = require('simple-quadtree');

class QuadtreeManager {
    constructor() {
        /**
         * Internally hold one quadtree, I can see someone wanting to write one that had multiple but
         * I'm not going to be concerned with that for now
         */
        this.quadtree = new SimpleQuadtree(0, 0, config.gameWidth, config.gameHeight);
    }

    /**
    * Use queryObject to query the internal quadtree
    * return exactly what the client needs to draw based on the results
    */
    queryGameObjects(queryObject) {

      /**
      * visible players are players that are within the screen of the current player
      * use quadtree for efficiency
      */
      var visibleTanks = [];
      var visibleBullets = [];
      var visibleWalls = [];

      this.quadtree.get(queryObject, function(quadtreeObject) {
          if(quadtreeObject.type === 'TANK') {
            var tank = quadtreeObject.object;
            visibleTanks.push({
                id: tank.id,
                x: tank.x,
                y: tank.y,
                hullDirection: tank.hullDirection,
                gunAngle: tank.gunAngle,
                rotationCorrection: tank.rotationCorrection,
                spriteTankHull: tank.spriteTankHull,
                spriteTankGun: tank.spriteTankGun,
                locationHistory: tank.locationHistory
            });
          }
          else if(quadtreeObject.type === 'BULLET') {
            visibleBullets.push(quadtreeObject.object);
          }
          else if(quadtreeObject.type === 'WALL') {
            visibleWalls.push(quadtreeObject.object);
          }
          return true;
      });

        /**
         * Note there is some dumbness going on here. The JSON spec says that
         * JSON objects have unordered properties. However, we are counting on these properties
         * being ordered when they are sent to the client, because the client will draw them in this order.
         * So for example, here tanks are drawn, then bullets, then walls.
         *
         * This is a poor choice, as an example, socket.io has every "right" to send the JSON object
         * over unordered, which could break our app!
         */
      return {
        "tanks":visibleTanks,
        "bullets":visibleBullets,
        "walls": visibleWalls
      };
  }

    getQuadtree() {
        return this.quadtree;
    }
}

module.exports = QuadtreeManager;