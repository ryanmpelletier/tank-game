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
        this.quadtree = new SimpleQuadtree(0, 0, config.startingGameWidth, config.startingGameHeight, {maxChildren: 25});
        this.currentWidth = config.startingGameWidth;
        this.currentHeight = config.startingGameHeight;
    }

    /**
    * Use queryObject to query the internal quadtree
    * return exactly what the client needs to draw based on the results
    */
    queryGameObjects(queryArea) {

        /**
         * Following arrays hold objects that are visible
         * (i.e. objects that are within the screen of the current player)
         * NOTE: QuadTree is used here for efficiency
         */
        var visibleTanks = [];
        var visibleBullets = [];
        var visibleWalls = [];

        this.quadtree.get(queryArea, function(quadtreeObject) {
            if(quadtreeObject.type === 'TANK') {
                visibleTanks.push(quadtreeObject.object);
            }
            else if(quadtreeObject.type === 'BULLET') {
                visibleBullets.push(quadtreeObject.object);
            }
            else if(quadtreeObject.type === 'WALL') {
                visibleWalls.push(quadtreeObject.object);
            }
            return true;
        });

        return {
            "tanks": visibleTanks,
            "bullets": visibleBullets,
            "walls": visibleWalls
        };
    }

    /**
     * Queries the entire game board and returns all game objects of a specific type.
     *
     * @param {String} gameObjectType - The type of game object to return a list of all objects of this type.
     * @returns {Array} The array containing all game objects of the desired type.
     */
    queryGameObjectsForType(gameObjectTypes, queryArea = {x: 0, y: 0, w: this.currentWidth, h: this.currentHeight}) {

        // Get ALL game objects
        var gameObjects = {};

        for(var i = 0; i < gameObjectTypes.length; i++){
            gameObjects[gameObjectTypes[i]] = [];
        }

        this.quadtree.get(queryArea, function(quadtreeObject){
            // Return only game objects of desired type
            if(gameObjectTypes.indexOf(quadtreeObject.type) > -1){
                gameObjects[quadtreeObject.type].push(quadtreeObject.object);
            }
            return true;
        });

        return gameObjects;
    }

    getQuadtree() {
        return this.quadtree;
    }

    //this method will create a new quadtree of the given size and copy the items from the current qudatree into it
    growQuadtree(width, height) {

        //instantiate new quadtree with new height and width
        var newQuadTree = new SimpleQuadtree(0, 0, width, height, {maxChildren: 25});


        //query current quadtree for all the objects in it and put them in the new quadtree
        this.quadtree.get({x: 0, y: 0, w: this.currentWidth, h: this.currentHeight}, function(quadtreeObject){
            newQuadTree.put(quadtreeObject);
            return true;
        });


        //record new height and width
        this.currentWidth = width;
        this.currentHeight = height;
    }
}

module.exports = QuadtreeManager;