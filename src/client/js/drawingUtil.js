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

            // Update boost bar
            let newBoostPercent = (tank._boostRemaining / 100) * 100;
            document.getElementById("boost-bar").style.width = newBoostPercent + "%";
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
        if(global.playerType === 'PLAYER') {
            var translateX = -(this.perspective.x - global.screenWidth / 2);
            var translateY = -(this.perspective.y - global.screenHeight / 2);
            this.context2D.translate(translateX, translateY);

            this.context2D.fillStyle = global.drawing.ammo.fill;

            let startX = this.perspective.x + global.drawing.ammo.tankXOffset;
            let startY = this.perspective.y + global.drawing.ammo.tankYOffset;

            for (let i = 0; i < ammo.capacity; i++) {
                if (i < ammo.count) {
                    this.context2D.fillRect((startX + (i * (global.drawing.ammo.width + global.drawing.ammo.spacing))), startY, global.drawing.ammo.width, global.drawing.ammo.height);
                } else {
                    this.context2D.rect((startX + (i * (global.drawing.ammo.width + global.drawing.ammo.spacing))), startY, global.drawing.ammo.width, global.drawing.ammo.height);
                }
            }
            this.context2D.translate(-translateX, -translateY);
        }
    }

    /**
     * Updates the leaderboard with the current leaders (i.e. "tank aces") in the game.
     *
     * @param scoreboardList
     *          The list of leaders to add to the scoreboard.
     */
    scoreboardDraw(scoreboardList) {
        let leaderboardRowsDiv = document.getElementById("leaderboard-rows");
        const MAX_ROW_COUNT = 10;
        let rowNum = 0;

        // Update leaderboard
        for(var score of scoreboardList) {
            if(rowNum === MAX_ROW_COUNT) {
                break;
            }

            leaderboardRowsDiv.children[rowNum].children[0].innerHTML = (rowNum + 1) + ")";
            leaderboardRowsDiv.children[rowNum].children[1].innerHTML = score.screenName;
            leaderboardRowsDiv.children[rowNum].children[2].innerHTML = score.kills;

            rowNum++;
        }

        // Clear old leaderboard rows
        for(; rowNum < MAX_ROW_COUNT; rowNum++) {
            leaderboardRowsDiv.children[rowNum].children[0].innerHTML = "";
            leaderboardRowsDiv.children[rowNum].children[1].innerHTML = "";
            leaderboardRowsDiv.children[rowNum].children[2].innerHTML = "";
        }
    }

    /**
     * Updates the radar with the objects on the game board
     *
     * @param radarObjects
     *      The objects to draw on the radar, which includes tanks and walls
     */
    radarDraw(radarObjects){

        //this is the ratio of radar size to actual game size, it will be used to draw scaled objects
        var horizontalScale = global.drawing.radar.width / global.gameWidth;
        var verticalScale = global.drawing.radar.height / global.gameHeight;

        var radarX = global.screenWidth - global.drawing.radar.width - global.drawing.radar.rightPadding;
        var radarY = global.screenHeight - global.drawing.radar.height - global.drawing.radar.bottomPadding;

        var walls = radarObjects['WALL'];
        this.context2D.fillStyle = global.drawing.radar.wallFill;
        for(var i = 0; i < walls.length; i++){
            this.context2D.fillRect(
                radarX + (walls[i].x * horizontalScale),
                radarY + (walls[i].y * verticalScale),
                (walls[i].w * horizontalScale),
                (walls[i].h * verticalScale)
            );
        }

        var tanks = radarObjects['TANK'];
        for(var j = 0; j < tanks.length; j++){
            if(global.screenName == tanks[j].screenName){
                this.context2D.fillStyle = global.drawing.radar.selfTankFill;
            }else{
                this.context2D.fillStyle = global.drawing.radar.tankFill;
            }
            this.context2D.fillRect(
                radarX + (tanks[j].x * horizontalScale),
                radarY + (tanks[j].y * verticalScale),
                (global.drawing.radar.tankWidth * horizontalScale),
                (global.drawing.radar.tankHeight * verticalScale)
            );
        }


        //draw radar
        this.context2D.fillStyle = global.drawing.radar.backgroundFill;

        this.context2D.fillRect(
            radarX,
            radarY,
            global.drawing.radar.width,
            global.drawing.radar.height
        );

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