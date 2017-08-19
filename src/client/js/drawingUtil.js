var global = require('./global');
var Sprite = require('../../server/lib/sprite');
var Util = require('../../server/lib/util');

/**
 * This is the class that holds a reference to the canvas.
 * Here we will write all the drawing functions.
 */
class DrawingUtil {
    constructor(canvas, perspective = {x: global.gameWidth / 2, y: global.gameHeight / 2},
                drawingOrder = global.drawing.drawingOrder) {
        this.canvas = canvas;
        this.context2D = canvas.getContext("2d");

        /**
         * Perspective is an important part of the DrawingUtil and
         * is necessary for almost all other drawing methods. This is the center of
         * where the client is 'looking' on the game board
         */
        this.perspective = perspective;
        this.drawingOrder = drawingOrder;

        this.tankHullImage = new Image();
        this.tankHullImage.src = "/img/sprite-tank-hull-256.png";

        this.tankGunImage = new Image();
        this.tankGunImage.src = "/img/sprite-tank-gun-256.png";
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
    perspectiveDraw(perspective) {
        //here is using a repeating background image to draw the background
        this.context2D.fillStyle = this.context2D.createPattern(document.getElementById('background_image'), 'repeat');

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
        this.context2D.fillText(`X: ${perspective.x}, Y: ${perspective.y}`, 10, 50);
        this.context2D.fillText(`Screen Width: ${global.screenWidth}, Screen Height: ${global.screenHeight}`,10,75);
        this.context2D.fillText(`Game Width: ${global.gameWidth}, Game Height: ${global.gameHeight}`, 10, 100);
    }

    /**
     * Draw all tanks (including user's tank).
     */
    tanksDraw(tanks) {
        var translateX = -(this.perspective.x - global.screenWidth / 2);
        var translateY = -(this.perspective.y - global.screenHeight / 2);

        this.context2D.translate(translateX, translateY);

        for(var tank of tanks) {
            // Draw tank hull
            Sprite.render(tank.spriteTankHull, this.context2D, this.tankHullImage, tank.x, tank.y);

            // Draw tank gun
            Sprite.render(tank.spriteTankGun, this.context2D, this.tankGunImage, tank.x, tank.y, tank.rotationCorrection);

            //Draw screen names and kills
            let startX = tank.x + global.drawing.playerInfo.tankXOffset;
            let startY = tank.y + global.drawing.playerInfo.tankYOffset;

            this.context2D.font = global.drawing.playerInfo.font;
            this.context2D.fillStyle = global.drawing.playerInfo.fontColor;
            this.context2D.fillText(`${tank.screenName} - ${tank.kills}`, startX, startY);
        }

        this.context2D.translate(-translateX, -translateY);
    }

    /**
     * Draws all bullets in user's current view.
     *
     * @param bullets
     *          The list of bullets to draw.
     */
    bulletsDraw(bullets) {
        var translateX = -(this.perspective.x - global.screenWidth/2);
        var translateY = -(this.perspective.y - global.screenHeight/2);
        this.context2D.translate(translateX, translateY);

        for(var i = 0; i < bullets.length; i++){
            var bullet = bullets[i];

            //draw circle in the center to represent bullet
            this.context2D.beginPath();
            this.context2D.fillStyle = 'black';
            this.context2D.arc(bullet.x, bullet.y, 4, 0, 2 * Math.PI);
            this.context2D.fill();
        }

        this.context2D.translate(-translateX, -translateY);

    }

    /**
     * Draws all tank tracks in user's current view.
     *
     * @param tracks
     *          The list of tank tracks to draw.
     */
    tracksDraw(tracks) {
        var translateX = -(this.perspective.x - global.screenWidth / 2);
        var translateY = -(this.perspective.y - global.screenHeight / 2);
        this.context2D.translate(translateX, translateY);

        this.context2D.fillStyle = "#bfa372";

        for(var track of tracks) {
            Util.drawRotatedRect(this.context2D, track.x, track.y, track.width, track.height, track.angle);
        }

        this.context2D.translate(-translateX, -translateY);
    }

    wallsDraw(walls) {
        var translateX = -(this.perspective.x - global.screenWidth/2);
        var translateY = -(this.perspective.y - global.screenHeight/2);
        this.context2D.translate(translateX, translateY);
        this.context2D.fillStyle = 'black';

        for(var wall of walls){
            this.context2D.fillRect(wall.x, wall.y, wall.w, wall.h);
        }
        
        this.context2D.translate(-translateX, -translateY);

    }

    ammoDraw(ammo) {
        var translateX = -(this.perspective.x - global.screenWidth/2);
        var translateY = -(this.perspective.y - global.screenHeight/2);
        this.context2D.translate(translateX, translateY);

        this.context2D.fillStyle = global.drawing.ammo.fill;

        let startX = this.perspective.x + global.drawing.ammo.tankXOffset;
        let startY = this.perspective.y + global.drawing.ammo.tankYOffset;

        for(let i = 0; i < ammo.capacity; i++){
            if(i < ammo.count){
                this.context2D.fillRect((startX + (i *(global.drawing.ammo.width + global.drawing.ammo.spacing))), startY, global.drawing.ammo.width, global.drawing.ammo.height);
            }else{
                this.context2D.rect((startX + (i *(global.drawing.ammo.width + global.drawing.ammo.spacing))), startY, global.drawing.ammo.width, global.drawing.ammo.height);
            }
        }
        this.context2D.translate(-translateX, -translateY);
    }

    scoreboardDraw(scoreboardList) {

        this.context2D.font = global.drawing.scoreboard.scoreboardHeadingFont;
        this.context2D.fillText('Leaderboard', global.screenWidth - global.drawing.scoreboard.heading.x, global.drawing.scoreboard.heading.y);


        //Draw screen names and kills
        let startX = global.screenWidth - global.drawing.scoreboard.scoreboardXOffset;
        let startY = global.drawing.scoreboard.scoreboardYOffset;

        this.context2D.font = global.drawing.scoreboard.font;
        this.context2D.fillStyle = global.drawing.scoreboard.fontColor;

        for(var score of scoreboardList){
            this.context2D.fillText(`${score.screenName} - ${score.kills}`,startX, startY);
            startY += global.drawing.scoreboard.scoreboardLineSpacing;
        }
    }

    /**
     * Given gameObjects, call the appropriate method on the drawingUtil
     * to draw that object.
     */
    drawGameObjects(gameObjects) {
        for (var key of this.drawingOrder) {
            if (gameObjects.hasOwnProperty(key) && typeof this[`${key}Draw`] !== 'undefined') {
                this[`${key}Draw`](gameObjects[key]);
            }
        }
    }

    setPerspective(x, y) {
        //shorthand ES6
        this.perspective = {x, y};
    }
}

module.exports = DrawingUtil;