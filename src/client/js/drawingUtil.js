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
         * By convention, name will be the key of the objects to draw from 
         * the "gameObjects" appended to the word "Draw". As an example, given
         * a key in "gameObjects" called "server_time" we will call the 
         * "server_timeDraw" method.
         */
        this.server_timeDraw = function(serverTime){
            var context = this.context2D;
            context.font = "20px Arial";
            context.fillText(serverTime,10,30);
        };

        /**
         * For now this is where I am going to draw the background
         */
        this.playerDraw = function(player){
            var background_props = global.background_props;

            //here is using a repeating background image to draw the background
            var img = document.getElementById('background_image');
            var pattern = this.context2D.createPattern(img, 'repeat');
            this.context2D.fillStyle = pattern;

            //translate canvas to where the edge of the game board is
            var translateX = -(player.position.x - global.screenWidth/2);
            var translateY = -(player.position.y - global.screenHeight/2);
            
            this.context2D.translate(translateX, translateY);
            this.context2D.fillRect(0,0,global.gameWidth,global.gameHeight);
            this.context2D.translate(-translateX,-translateY);

            /**
             * For debugging purposes, draw helpful data about screenSize, gameWidth, and user position
             */
            this.context2D.font = "20px Arial";
            this.context2D.fillStyle = "red";
            this.context2D.fillText('X: ' + player.position.x + ', Y: ' + player.position.y,10,50);
            this.context2D.fillText('Screen Width: ' + global.screenWidth + ', Screen Height: ' + global.screenHeight,10,75);
            this.context2D.fillText('Game Width: ' + global.gameWidth + ', Game Height: ' + global.gameHeight, 10, 100);
            //draw dot in the center to represent person
            this.context2D.beginPath();
            this.context2D.strokeStyle = 'white';
            this.context2D.arc(global.screenWidth/2,global.screenHeight/2,15,0,2*Math.PI);
            this.context2D.stroke();
        }
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
}

module.exports = DrawingUtil;