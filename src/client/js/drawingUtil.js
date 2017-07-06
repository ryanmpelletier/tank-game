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


            /**
             * For debugging purposes, draw helpful data about screenSize, gameWidth, and user position
             */

            this.context2D.font = "20px Arial";
            this.context2D.fillText('X: ' + player.position.x + ', Y: ' + player.position.y,10,50);
            this.context2D.fillText('Screen Width: ' + global.screenWidth + ', Screen Height: ' + global.screenHeight,10,75);
            this.context2D.fillText('Game Width: ' + global.gameWidth + ', Game Height: ' + global.gameHeight, 10, 100);


            /**
             * Calculate where vertical lines will start being drawn on left side of screen.
             */
            var leftSideOfUserView = player.position.x - global.screenWidth/2;
            var pixelsBeforeFirstVerticalLine;
            if(leftSideOfUserView < 0){
                pixelsBeforeFirstVerticalLine = - leftSideOfUserView;
            }else{
                pixelsBeforeFirstVerticalLine = leftSideOfUserView % background_props.cellWidth;
            }

            /**
             * Calculate where horizontal lines will start being drawn from the top of ths screen
             */
            var topSideOfuserView = player.position.y - global.screenHeight/2;
            var pixelsBeforeFirstHorizontalLine;
            if(topSideOfuserView < 0){
                pixelsBeforeFirstHorizontalLine = -topSideOfuserView;
            }else {
                pixelsBeforeFirstHorizontalLine = topSideOfuserView % background_props.cellHeight;
            }


            /**
             * Calculate total number of vertical lines to be drawn.
             */
            var lastVerticalLine;
            if((global.screenWidth/2 + player.position.x) > global.gameWidth){
                var distanceOverflowed = ((global.screenWidth/2 + player.position.x) - global.gameWidth);
                lastVerticalLine = global.screenWidth - distanceOverflowed;
            }else{
                lastVerticalLine = global.screenWidth;
            }
            var totalNumberOfVerticalLines = Math.floor((lastVerticalLine - pixelsBeforeFirstVerticalLine)/background_props.cellWidth) + 1;;

            /**
             * Calculate total number of horizontal lines to be drawn.
             */
            var lastHorizontalLine;
            if((global.screenHeight/2 + player.position.y) > global.gameHeight){
                var distanceOverflowed = ((global.screenHeight/2 + player.position.y) - global.gameHeight);
                lastHorizontalLine = global.screenHeight - distanceOverflowed;
            }else{
                lastHorizontalLine = global.screenHeight;
            }
            
            var totalNumberOfHorizontalLines = Math.floor((lastHorizontalLine - pixelsBeforeFirstHorizontalLine)/background_props.cellHeight) + 1;


            /**
             * Draw vertical lines
             */
            for(var i = pixelsBeforeFirstVerticalLine; i < (totalNumberOfVerticalLines * background_props.cellWidth + pixelsBeforeFirstVerticalLine); i+=background_props.cellWidth){
                this.context2D.beginPath();
                if(topSideOfuserView < 0){
                    this.context2D.moveTo(i, pixelsBeforeFirstHorizontalLine);
                }else{
                    this.context2D.moveTo(i, 0);
                }
                this.context2D.lineTo(i, lastHorizontalLine);
                this.context2D.stroke();
            }

            /**
             * Draw horizontal lines
             */
            for(var i = pixelsBeforeFirstHorizontalLine; i < (totalNumberOfHorizontalLines * background_props.cellHeight + pixelsBeforeFirstHorizontalLine); i+=background_props.cellHeight){
                this.context2D.beginPath();
                if(leftSideOfUserView < 0){
                    this.context2D.moveTo(pixelsBeforeFirstVerticalLine, i);
                }else{
                    this.context2D.moveTo(0, i);
                }
                this.context2D.lineTo(lastVerticalLine, i);
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