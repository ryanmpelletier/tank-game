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

            // //left border line
            // this.context2D.beginPath();
            // this.context2D.moveTo(firstVerticalLineXValue,firstHorizontalLineYValue);
            // this.context2D.lineTo(firstVerticalLineXValue,secondHorizontalLineYValue);
            // this.context2D.stroke();

            // //right border line
            // this.context2D.beginPath();
            // this.context2D.moveTo(secondVerticalLineXValue,firstHorizontalLineYValue);
            // this.context2D.lineTo(secondVerticalLineXValue, secondHorizontalLineYValue);
            // this.context2D.stroke();

            // //top border line
            // this.context2D.beginPath();
            // this.context2D.moveTo(firstVerticalLineXValue,firstHorizontalLineYValue);
            // this.context2D.lineTo(secondVerticalLineXValue, firstHorizontalLineYValue);
            // this.context2D.stroke();

            // //bottom border line
            // this.context2D.beginPath();
            // this.context2D.moveTo(firstVerticalLineXValue, secondHorizontalLineYValue);
            // this.context2D.lineTo(secondVerticalLineXValue, secondHorizontalLineYValue);
            // this.context2D.stroke();

            //here is using a repeating background image to draw the background (This is experimental code at this point)
            var img = document.getElementById('background_image');
            var pattern = this.context2D.createPattern(img, 'repeat');
            this.context2D.fillStyle = pattern;
            //here is my mistake, these can't be based on first line values because these default to 0 or gamewidth/gameheight, I need the true value
            //I think here the translation needs to go all the way out to the game board!
            //so here I need to translate the canvas starting x,y coordinate out to the upper left corner of the game board
            //then the pattern will be drawn correctly over the client screen
            //but I still need to make sure I am only drawing a certain window of that view?

            // this.context2D.translate(firstVerticalLineXValue, firstHorizontalLineYValue);
            // this.context2D.fillRect(0,0,(secondVerticalLineXValue - firstVerticalLineXValue),(secondHorizontalLineYValue - firstHorizontalLineYValue));
            // this.context2D.translate(-firstVerticalLineXValue, -firstHorizontalLineYValue);

            //1. Canvas translation goes all the way out to the corner of the game boardwds
            //2. Rather than start at 0,0 for rect, need to start at firstVerticalLineXValue, firstHorizontalLineYValue
            var translateX = -(player.position.x - global.screenWidth/2);
            var translateY = -(player.position.y - global.screenHeight/2);
            //translate canvas to where the gameboard is
            this.context2D.translate(translateX, translateY);
            this.context2D.fillRect(0,0,(secondVerticalLineXValue - firstVerticalLineXValue),(secondHorizontalLineYValue - firstHorizontalLineYValue));
            this.context2D.translate(-translateX,-translateY);
            //draw dot in the center to represent person
            this.context2D.beginPath();
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