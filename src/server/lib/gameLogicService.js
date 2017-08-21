/**
 *  Class for writing game logic functions and steps in a more readable way.
 * Purpose is to remove game logic from server.js, which I would like to basically just have framework code.
 */

var config = require('../../../config.json');
var Wall = require('./wall');
var Bullet = require('./bullet');
var Track = require('./track');
var Direction = require('./direction');
var util = require('./util');
var winston = require('winston');
winston.level = 'debug';

class GameLogicService {
    constructor(quadtreeManager) {
        this.quadtreeManager = quadtreeManager;
        this.quadtree = quadtreeManager.getQuadtree();
    }

    //this initializeGame() code can pretty much take as long as it wants, no players will be waiting for this code to finish
    initializeGame() {
        /**
         * Initialize border walls, put them in the quadtree
         * I'm still not sure I want to use the quadtree to store data for the borders.
         * I don't know how much it will help us, it might even not help. 
         */
        var leftBorderWall = new Wall(0, 0, config.wallWidth, config.gameHeight);
        var topBorderWall = new Wall(config.wallWidth, 0, config.gameWidth - 2 * config.wallWidth, config.wallWidth);
        var rightBorderWall = new Wall(config.gameWidth - config.wallWidth, 0, config.wallWidth, config.gameHeight);
        var bottomBorderWall = new Wall(config.wallWidth, config.gameHeight - config.wallWidth, config.gameWidth - 2 * config.wallWidth, config.wallWidth);

        this.quadtree.put(leftBorderWall.forQuadtree());
        this.quadtree.put(topBorderWall.forQuadtree());
        this.quadtree.put(rightBorderWall.forQuadtree());
        this.quadtree.put(bottomBorderWall.forQuadtree());

        for(var i = 0; i < config.wallCount; i++){
            //random x,y to start barrier
            var x = Math.floor((Math.random() * config.gameWidth));
            var y = Math.floor((Math.random() * config.gameHeight));


            var w;
            var h;

            /*
                Half the rows tend to be wider than long, the other half tend to be longer than wide.
                I did this because I want more rectangular shapes than square shapes.
             */
            if(i % 2 === 0){
                w = Math.max(config.minWallDimension, Math.floor((Math.random() * (config.maxWallDimension / 3))));
                h = Math.max(config.minWallDimension,Math.floor((Math.random() * config.maxWallDimension)));
            }else{
                w = Math.max(config.minWallDimension, Math.floor((Math.random() * config.maxWallDimension)));
                h = Math.max(config.minWallDimension,Math.floor((Math.random() * (config.maxWallDimension / 3))));
            }

            var wall = new Wall(x,y,Math.min(config.gameWidth - x,w),Math.min(config.gameHeight - y,h));
            this.quadtree.put(wall.forQuadtree());
        }
    }

    gameTick(clientData, socket, currentClientDatas) {
        var currentTime = new Date().getTime();

        if(clientData.lastHeartbeat < currentTime - config.maxLastHeartBeat){
            winston.log('debug',`Kicking player ${clientData.tank.screenName}`);
            this.kill(clientData, socket);
        }else{
            this.updatePlayerPosition(clientData);
            this.increaseAmmoIfNecessary(clientData,currentTime);
            this.updatePositionsOfBullets(clientData, this.quadtreeManager);
            this.fireBulletsIfNecessary(clientData, currentTime);
            this.handleCollisionsOnTank(clientData, socket, currentClientDatas);
            this.updateTracks(this.quadtreeManager, this.quadtree);
        }
    }


    updatePlayerPosition(clientData) {
        let player = clientData.player;
        let tank = clientData.tank;

        /**
         * Set tank gun angle
         */
        if(typeof player.userInput.mouseAngle !== 'undefined'){
            tank.gunAngle = player.userInput.mouseAngle;
        }

        var oldQuadreeInfo = clientData.forQuadtree();
        var oldPosition = clientData.position;
        var newPosition = {
            x: clientData.position.x,
            y: clientData.position.y
        };

        /**
         *  Update player position based on input
         */

        // Check if user's position should move UP
        if(player.userInput.keysPressed['KEY_UP'] &&
            !player.userInput.keysPressed['KEY_DOWN']) {
            newPosition.y = oldPosition.y - config.player.speedFactor;
        }
        // Check if user's position should move DOWN
        else if(player.userInput.keysPressed['KEY_DOWN'] &&
            !player.userInput.keysPressed['KEY_UP']) {
            newPosition.y = oldPosition.y + config.player.speedFactor;
        }

        // Check if user's position should move RIGHT
        if(player.userInput.keysPressed['KEY_RIGHT'] &&
            !player.userInput.keysPressed['KEY_LEFT']) {
            newPosition.x = oldPosition.x + config.player.speedFactor;
        }
        // Check if user's position should move LEFT
        else if(player.userInput.keysPressed['KEY_LEFT'] &&
            !player.userInput.keysPressed['KEY_RIGHT']) {
            newPosition.x = oldPosition.x - config.player.speedFactor;
        }

        // Check if tank has moved since last update
        // (Necessary to check because otherwise tank's direction will keep going
        // back to North every time that it stops moving)
        if(!util.areCoordinatesEqual(oldPosition, newPosition)) {
            // Tank has moved so update its direction
            let angleInRadians = Math.atan2(newPosition.y - oldPosition.y, newPosition.x - oldPosition.x);
            tank.hullAngle = angleInRadians;

            // Update tank's frame since tank is moving
            tank.spriteTankHull.update();

            this.addTracks(tank, newPosition, angleInRadians);
        }

        clientData.position = newPosition;

        /**
        * Update the item on the quadtree
        */
        this.quadtree.remove(oldQuadreeInfo, 'id');
        this.quadtree.put(clientData.forQuadtree());
    };

    /**
     * Adds tracks for the current tank to the QuadTree and associates the tracks with a certain tank path.
     *
     * @param tank
     * @param newPosition
     * @param angleInRadians
     */
    addTracks(tank, newPosition, angleInRadians) {
        // Check if delay been track creation has finished
        if(!tank.path.hasFinishedDelay()) {
            // Delay has not been reached so don't create more tracks
            return;
        }

        let trackOneDestX = 0;
        let trackOneDestY = 0;
        let trackTwoDestX = 0;
        let trackTwoDestY = 0;

        let scaledHalfSingleFrame = tank.spriteTankHull.singleFrameWidth / 2 * tank.spriteTankHull.scaleFactorWidth;

        // Correction is the value from the center of the tank (newPosition.x, newPosition.y) to where the the track
        // actually needs to be rendered (i.e. in line with the left/right tank wheel).
        //
        // Came up with the magic fractions below by first seeing what number of units needed to move for this specific
        // tank sprite width and height (config values were 85 px for width/height). In this case, correction value
        // turned out to be 22.5 for horizontal/vertical and 32 for vertical) and then divided these values
        // by scaledHalfSingleFrame:
        //     22.5 / 42.5 = 0.529411764705882
        //     32.0 / 42.5 = 0.752941176470588
        //
        // These magical fractions allow the tracks to be rendered at the correct location behind a tank's wheels for
        // any size tank (i.e. tank width/height can be changed without having to manually fix where the tracks are
        // rendered).
        let straightCorrection = 0.529411764705882 * scaledHalfSingleFrame;
        let diagonalCorrection = 0.752941176470588 * scaledHalfSingleFrame;

        switch(angleInRadians) {
            case Direction.E: // East
                trackOneDestX = newPosition.x + straightCorrection;
                trackOneDestY = newPosition.y - straightCorrection;
                trackTwoDestX = newPosition.x + straightCorrection;
                trackTwoDestY = newPosition.y + straightCorrection;
                break;
            case Direction.SE: // South East
                trackOneDestX = newPosition.x;
                trackOneDestY = newPosition.y + diagonalCorrection;
                trackTwoDestX = newPosition.x + diagonalCorrection;
                trackTwoDestY = newPosition.y;
                break;
            case Direction.S: // South
                trackOneDestX = newPosition.x - straightCorrection;
                trackOneDestY = newPosition.y + straightCorrection;
                trackTwoDestX = newPosition.x + straightCorrection;
                trackTwoDestY = newPosition.y + straightCorrection;
                break;
            case Direction.SW: // South West
                trackOneDestX = newPosition.x - diagonalCorrection;
                trackOneDestY = newPosition.y;
                trackTwoDestX = newPosition.x;
                trackTwoDestY = newPosition.y + diagonalCorrection;
                break;
            case Direction.W: // West
                trackOneDestX = newPosition.x - straightCorrection;
                trackOneDestY = newPosition.y - straightCorrection;
                trackTwoDestX = newPosition.x - straightCorrection;
                trackTwoDestY = newPosition.y + straightCorrection;
                break;
            case Direction.NW: // North West
                trackOneDestX = newPosition.x - diagonalCorrection;
                trackOneDestY = newPosition.y;
                trackTwoDestX = newPosition.x;
                trackTwoDestY = newPosition.y - diagonalCorrection;
                break;
            case Direction.N: // North
                trackOneDestX = newPosition.x - straightCorrection;
                trackOneDestY = newPosition.y - straightCorrection;
                trackTwoDestX = newPosition.x + straightCorrection;
                trackTwoDestY = newPosition.y - straightCorrection;
                break;
            case Direction.NE: // North East
                trackOneDestX = newPosition.x;
                trackOneDestY = newPosition.y - diagonalCorrection;
                trackTwoDestX = newPosition.x + diagonalCorrection;
                trackTwoDestY = newPosition.y;
                break;
        }

        let trackOne = new Track(trackOneDestX, trackOneDestY, angleInRadians, tank.path.id);
        let trackTwo = new Track(trackTwoDestX , trackTwoDestY, angleInRadians, tank.path.id);

        // Add new tank tracks since tank has changed location
        this.quadtree.put(trackOne.forQuadtree());
        this.quadtree.put(trackTwo.forQuadtree());
    };

    increaseAmmoIfNecessary(clientData, time) {
        /**
         * Increase ammo if necessary
         */
        if(clientData.tank.ammo < config.tankAmmoCapacity && ((time - clientData.tank.lastAmmoEarned > config.tankTimeToGainAmmo) || typeof clientData.tank.lastAmmoEarned === 'undefined')){
            clientData.tank.ammo = clientData.tank.ammo + 1;
            clientData.tank.lastAmmoEarned = time;
        }
    };

    updatePositionsOfBullets(clientData, quadtreeManager) {
        /**
        * Update positions of all the bullets
        */
        for(var bullet of clientData.tank.bullets) {
            let oldTreeInfo = bullet.forQuadtree();
            //if bullet is in wall, remove the bullet, else update the position
            if(quadtreeManager.queryGameObjectsForType(['WALL'], oldTreeInfo)['WALL'].length){
                let bulletIndex = util.findIndex(clientData.tank.bullets, bullet.id);
                if(bulletIndex > -1){
                    clientData.tank.bullets.splice(bulletIndex,1);
                    this.quadtree.remove(bullet.forQuadtree(), 'id');
                }
            }else{
                bullet.x = bullet.x + bullet.velocityX;
                bullet.y = bullet.y - bullet.velocityY;
                let forQuadtree = bullet.forQuadtree();

                this.quadtree.remove(oldTreeInfo, 'id');
                this.quadtree.put(forQuadtree);
            }
        }
    };

    fireBulletsIfNecessary(clientData, time) {
        /**
        * Fire bullets if necessary
        */
        if(typeof clientData.player.userInput.mouseClicked !== 'undefined') {
            if(clientData.player.userInput.mouseClicked &&
                clientData.tank.ammo > 0 &&
                (typeof clientData.tank.lastFireTime === 'undefined' ||
                (time - clientData.tank.lastFireTime > config.tankFireTimeWait))) {

                clientData.tank.lastFireTime = time;
                clientData.tank.ammo = clientData.tank.ammo - 1;

                var xComponent = Math.cos(clientData.tank.gunAngle);
                var yComponent = Math.sin(clientData.tank.gunAngle);

                var bullet = new Bullet(clientData.id,
                    clientData.tank.x + (xComponent * config.tankBarrelLength),
                    clientData.tank.y - (yComponent * config.tankBarrelLength),
                    xComponent * config.bulletVelocity,
                    yComponent * config.bulletVelocity);

                this.quadtree.put(bullet.forQuadtree());
                clientData.tank.bullets.push(bullet);
            }
        }
    };

    handleCollisionsOnTank(clientData, socket, currentClientDatas) {
        /**
         * Check any collisions on tank
         */
        var objectsInTankArea = this.quadtree.get(clientData.tank.forQuadtree());
        for(var objectInTankArea of objectsInTankArea){
            if(objectInTankArea.type === 'BULLET'){
                var bullet = objectInTankArea.object;

                // Check if bullet belongs to tank who shot the bullet
                if(bullet.ownerId == clientData.tank.id) {
                    // Stop tanks from killing themselves
                    continue;
                }

                var playerIndex = util.findIndex(currentClientDatas, bullet.ownerId);

                //update that player's score
                currentClientDatas[playerIndex].tank.kills = currentClientDatas[playerIndex].tank.kills + 1;

                //remove bullet
                if(playerIndex > -1) {
                    var bulletIndex = util.findIndex(currentClientDatas[playerIndex].tank.bullets, bullet.id);
                    if(bulletIndex > -1){
                        currentClientDatas[playerIndex].tank.bullets.splice(bulletIndex,1);
                        this.quadtree.remove(bullet.forQuadtree(), 'id');
                    }
                }
                //destroy tank
                this.kill(clientData, socket);
            }else if(objectInTankArea.type === 'WALL'){
                this.kill(clientData, socket);
            }
        }
    }

    updateTracks(quadtreeManager, quadtree) {
        var objects = quadtreeManager.queryGameObjectsForType(['TRACK']);
        objects['TRACK'].forEach(function(track) {
            // Check if track should disappear
            if(track.hasExpired()) {
                // Remove track by uniquely identifiable attribute
                quadtree.remove(track.forQuadtree(), 'id');
            }
            else {
                // Update track (remove existing and put track with updated tickCount)
                // tickCount was updated in call to hasExpired
                quadtree.remove(track.forQuadtree(), 'id');
                quadtree.put(track.forQuadtree());
            }
        });
    };

    kill(clientData, socket){
        clientData.tank.isAlive = false;
        socket.emit('death');
        socket.disconnect();
    }


    /*
     * This code is dangerous, will try to place user over and over again indefinitely,
     * need to eventually have a max amount of tries. We can't just stall the entire game because someone can't be placed.
     * I hope to make the game board dynamically grow.
     */
    static getSpawnLocation(quadtreeManager){
        outerLoop: while(true){
            //generate random x and y within the board
            var x = Math.floor((Math.random() * config.gameWidth));
            var y = Math.floor((Math.random() * config.gameHeight));

            //query quadtree for objects of certain type within a certain area of that location
            //TODO optimize by directly using the quadtree, which can stop a query once a certain object is found
            var objects = quadtreeManager.queryGameObjectsForType(['BULLET', 'WALL', 'TANK'], {x:(x - config.spawnAreaWidth / 2), y:(y - config.spawnAreaHeight / 2), w: config.spawnAreaWidth , h: config.spawnAreaHeight });

            //if any of the objects came back which can kill a tank, get different random coordinates
            for(var key of Object.keys(objects)){
                if (objects.hasOwnProperty(key) && objects[key].length > 0) {
                    continue outerLoop;
                }
            }

            return {
                x: x,
                y: y
            }

        }

    }

}

module.exports = GameLogicService;