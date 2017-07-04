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
            context.font = "30px Arial";
            context.fillText(serverTime,10,50);
        };

        /**
         * For now this is where I am going to draw the background
         */
        this.playerDraw = function(player){
            var background_props = global.background_props;

            /**
             * Draw vertical lines
             */
            var leftSideOfUserView = player.position.x - global.screenWidth/2;
            var pixelsBeforeFirstVerticalLine = leftSideOfUserView % background_props.cellWidth;
            //this loop should be limited by the amount of cells which will fit on the canvas
            for(var i = 0; i < 100; i++){
                this.context2D.beginPath();
                this.context2D.moveTo(pixelsBeforeFirstVerticalLine + (i * background_props.cellWidth), 0);
                this.context2D.lineTo(pixelsBeforeFirstVerticalLine + (i * background_props.cellWidth), this.canvas.height);
                this.context2D.stroke();
            }

            /**
             * Draw horizontal lines
             */
            var topSideOfuserView = player.position.y - global.screenHeight/2;
            var pixelsBeforeFirstHorizontalLine = topSideOfuserView % background_props.cellHeight;
            for(var i = 0; i < 100; i++){
                this.context2D.beginPath();
                this.context2D.moveTo(0,pixelsBeforeFirstHorizontalLine + (i * background_props.cellHeight));
                this.context2D.lineTo(this.canvas.width, pixelsBeforeFirstHorizontalLine + (i * background_props.cellHeight));
                this.context2D.stroke();
            }
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