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
             * Also draw dot in the center representing user
             */

            this.context2D.font = "20px Arial";
            this.context2D.fillText('X: ' + player.position.x + ', Y: ' + player.position.y,10,50);
            this.context2D.fillText('Screen Width: ' + global.screenWidth + ', Screen Height: ' + global.screenHeight,10,75);
            this.context2D.fillText('Game Width: ' + global.gameWidth + ', Game Height: ' + global.gameHeight, 10, 100);

            this.context2D.beginPath();
            this.context2D.arc(global.screenWidth/2,global.screenHeight/2,15,0,2*Math.PI);
            this.context2D.stroke();

            //these calculations will let us know where our browser window is in relation to the game board
            var leftViewToGameEdge = player.position.x - global.screenWidth/2;
            var topViewToGameEdge = player.position.y - global.screenHeight/2;
            var bottomViewToGameEdge = player.position.y + global.screenHeight/2;
            var rightViewToGameEdge = player.position.x + global.screenWidth/2;

            //these are the x and y values for where to draw the game board bounding box
            //NOTE: the logic is not perfect here, this will break if the game board is not inside the user's window AT ALL, which we assume cannot happen
            var firstVerticalLineXValue = (leftViewToGameEdge < 0 ? -leftViewToGameEdge : 0);
            var firstHorizontalLineYValue = (topViewToGameEdge < 0 ? -topViewToGameEdge : 0);
            var secondHorizontalLineYValue = (bottomViewToGameEdge > global.gameHeight ? (global.screenHeight - (bottomViewToGameEdge - global.gameHeight)) : this.canvas.height);
            var secondVerticalLineXValue = (rightViewToGameEdge > global.gameWidth ? (global.screenWidth - (rightViewToGameEdge - global.gameWidth)) : this.canvas.width);

            //now I can draw the border

            //left border line
            this.context2D.beginPath();
            this.context2D.moveTo(firstVerticalLineXValue,firstHorizontalLineYValue);
            this.context2D.lineTo(firstVerticalLineXValue,secondHorizontalLineYValue);
            this.context2D.stroke();

            //right border line
            this.context2D.beginPath();
            this.context2D.moveTo(secondVerticalLineXValue,firstHorizontalLineYValue);
            this.context2D.lineTo(secondVerticalLineXValue, secondHorizontalLineYValue);
            this.context2D.stroke();

            //top border line
            this.context2D.beginPath();
            this.context2D.moveTo(firstVerticalLineXValue,firstHorizontalLineYValue);
            this.context2D.lineTo(secondVerticalLineXValue, firstHorizontalLineYValue);
            this.context2D.stroke();

            //bottom border line
            this.context2D.beginPath();
            this.context2D.moveTo(firstVerticalLineXValue, secondHorizontalLineYValue);
            this.context2D.lineTo(secondVerticalLineXValue, secondHorizontalLineYValue);
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