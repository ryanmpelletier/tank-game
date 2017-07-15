/**
 * I want to abstract away the Quadtree from the server.js file. I would like this class to be the type of thing
 * that could be "implemented" on a per game basis. For example, I would like it if the server just said 
 * "give me all the objects I need to draw that are inside this area", then that same object was
 * sent directly to the client. 
 * This class itself doesn't need to do anything with game logic, all that will still be happening in the server (which makes me think...will I want more abstraction?)
 */
var config = require('../../../config.json');
var SimpleQuadtree = require('simple-quadtree');

class QuadtreeManager {
  constructor() {
    //internally hold one quadtree (I can see someone wanting to write a QuadtreeManager with multiple quadtrees)
    this.quadtree = new SimpleQuadtree(0, 0, config.gameWidth, config.gameHeight);
  }
    
  //everything needed to draw
  queryGameObjects(queryObject){

      /**
      * visible players are players that are within the screen of the current player
      * use quadtree for efficiency
      */
      var visiblePlayers = [];
      
      this.quadtree.get(queryObject, function(quadtreeObject){
          visiblePlayers.push({x:quadtreeObject.x, y:quadtreeObject.y});
          return true;
      });

      return {
        "perspective":{
            x: queryObject.x + queryObject.w/2,
            y: queryObject.y + queryObject.h/2
        },
        "players":visiblePlayers
      };
  }

  getQuadtree(){
    return this.quadtree;
  }
}

module.exports = QuadtreeManager;