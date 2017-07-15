var global = require('./global');
/**
 * This is the class that holds a reference to the canvas.
 * Here we will write all the drawing functions.
 */
class DrawingUtil{
    constructor(canvas){
        this.canvas = canvas;
        this.context2D = canvas.getContext("2d");

        /**
         * Perspective is an important part of the DrawingUtil and
         * is necessary for almost all other drawing methods. This is the center of
         * where the client is 'looking' on the game board
         */
        this.perspective = {
            x: global.gameWidth/2,
            y: global.gameHeight/2
        };
    }

    /**
     * By convention, name of drawing functions will be the key of the objects to draw from 
     * the "gameObjects" appended to the word "Draw". As an example, given
     * a key in "gameObjects" called "perspective" we will call the 
     * "perspectiveDraw" method.
     */

    /**
     * Draw the background
     */
    perspectiveDraw(perspective){
        //here is using a repeating background image to draw the background
        var img = document.getElementById('background_image');
        var pattern = this.context2D.createPattern(img, 'repeat');
        this.context2D.fillStyle = pattern;

        //translate canvas to where the edge of the game board is
        var translateX = -(perspective.x - global.screenWidth/2);
        var translateY = -(perspective.y - global.screenHeight/2);
        
        this.context2D.translate(translateX, translateY);
        this.context2D.fillRect(0,0,global.gameWidth, global.gameHeight);
        this.context2D.translate(-translateX, -translateY);

        /**
         * For debugging purposes, draw helpful data about screenSize, gameWidth, and user position
         */
        this.context2D.font = "20px Arial";
        this.context2D.fillStyle = "red";
        this.context2D.fillText('X: ' + perspective.x + ', Y: ' + perspective.y, 10, 50);
        this.context2D.fillText('Screen Width: ' + global.screenWidth + ', Screen Height: ' + global.screenHeight,10,75);
        this.context2D.fillText('Game Width: ' + global.gameWidth + ', Game Height: ' + global.gameHeight, 10, 100);
    }

    /**
     * Draw the positions of the other players
     */
    playersDraw(players){
        var translateX = -(this.perspective.x - global.screenWidth/2);
        var translateY = -(this.perspective.y - global.screenHeight/2);
        
        this.context2D.translate(translateX, translateY);
        for(var i = 0; i < players.length; i++){
            //draw dot in the center to represent person
            this.context2D.beginPath();
            this.context2D.strokeStyle = 'red';
            this.context2D.arc(players[i].x, players[i].y, 15, 0, 2*Math.PI);
            this.context2D.stroke();
        }
        this.context2D.translate(-translateX, -translateY);
    }

    /**
     * Given gameObjects, call the appropriate method on the drawingUtil
     * to draw that object.
     */
    drawGameObjects(gameObjects){
        for (var key in gameObjects) {
            if (gameObjects.hasOwnProperty(key) && typeof this[key + 'Draw'] !== 'undefined') {
                this[key + 'Draw'](gameObjects[key]);
            }
        }
    }

    setPerspective(x,y){
        this.perspective = {
            x:x,
            y:y
        }
    }
}

module.exports = DrawingUtil;