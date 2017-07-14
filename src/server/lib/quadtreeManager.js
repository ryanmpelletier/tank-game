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
    //internally hold one quadtree
    this.quadtree = new SimpleQuadtree(0, 0, config.gameWidth, config.gameHeight);

  }
    
  //return all game objects in a drawable format (this might be hard to do, will quadtree have all the necessary information?)
  queryGameObjects(x,y,w,h){
    console.log("TODO - write query game objects");
  }

  addObject(){
    console.log("TODO - write add object");
  }

  removeObject(){
    console.log("TODO - write remove object");
  }

  updateObject(){
    console.log("TODO - write update object");
  }

  getQuadtree(){
    return this.quadtree;
  }
}

module.exports = QuadtreeManager;