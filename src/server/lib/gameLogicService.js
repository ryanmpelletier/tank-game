/**
 *  Class for writing game logic functions and steps in a more readable way.
 * Purpose is to remove game logic from server.js, which I would like to basically just have framework code.
 */
var config = require('../../../config.json');
var Wall = require('./wall');
var Bullet = require('./bullet');
var util = require('./util');


class GameLogicService {
    constructor(quadtree) {
        this.quadtree = quadtree;
    }

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
    }

    gameTick(clientData, socket, currentClientDatas) {
        var currentTime = new Date().getTime();

        /**
         * Kick player if necessary
         */
        if(clientData.lastHeartbeat < currentTime - config.maxLastHeartBeat) {
            console.log(`[INFO] Kicking player ${clientData.player.screenName}`);
            socket.emit('kick');
            socket.disconnect();
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
        if(clientData.player.userInput.keysPressed['KEY_UP'] &&
            !clientData.player.userInput.keysPressed['KEY_DOWN']) {
            newPosition.y = oldPosition.y - config.player.speedFactor;
        }
        // Check if user's position should move DOWN
        else if(clientData.player.userInput.keysPressed['KEY_DOWN'] &&
            !clientData.player.userInput.keysPressed['KEY_UP']) {
            newPosition.y = oldPosition.y + config.player.speedFactor;
        }

        // Check if user's position should move RIGHT
        if(clientData.player.userInput.keysPressed['KEY_RIGHT'] &&
            !clientData.player.userInput.keysPressed['KEY_LEFT']) {
            newPosition.x = oldPosition.x + config.player.speedFactor;
        }
        // Check if user's position should move LEFT
        else if(clientData.player.userInput.keysPressed['KEY_LEFT'] &&
            !clientData.player.userInput.keysPressed['KEY_RIGHT']) {
            newPosition.x = oldPosition.x - config.player.speedFactor;
        }

        // Check if tank has moved since last update
        // (Necessary to check because otherwise tank's direction will keep going
        // back to North every time that it stops moving)
        if(!util.areCoordinatesEqual(oldPosition, newPosition)) {
            // Tank has moved so update its direction
            var angleInRadians = Math.atan2(newPosition.y - oldPosition.y, newPosition.x - oldPosition.x);
            clientData.tank.hullDirection = angleInRadians;

            // Update tank's frame since tank is moving
            clientData.tank.sprite.update();
        }

        clientData.position = newPosition;

        /**
        * Update the item on the quadtree
        */
        this.quadtree.update(oldQuadreeInfo, 'id', clientData.forQuadtree());

        /**
         * Increase ammo if necessary
         */
        if(clientData.tank.ammo < config.tankAmmoCapacity && ((currentTime - clientData.tank.lastAmmoEarned > config.tankTimeToGainAmmo) || typeof clientData.tank.lastAmmoEarned == 'undefined')){
            clientData.tank.ammo = clientData.tank.ammo + 1;
            clientData.tank.lastAmmoEarned = currentTime;
        }

        /**
        * Update positions of all the bullets
        */
        for(var bullet of clientData.tank.bullets) {
            let oldTreeInfo = bullet.forQuadtree();
            bullet.x = bullet.x + bullet.velocityX;
            bullet.y = bullet.y - bullet.velocityY;
            this.quadtree.update(oldTreeInfo, 'id', bullet.forQuadtree());
        }

        /**
        * Fire bullets if necessary
        */
        if(typeof clientData.player.userInput.mouseClicked != 'undefined') {
            if(clientData.player.userInput.mouseClicked &&
                clientData.tank.ammo > 0 &&
                (typeof clientData.tank.lastFireTime == 'undefined' ||
                (currentTime - clientData.tank.lastFireTime > config.tankFireTimeWait))) {

                clientData.tank.lastFireTime = currentTime;
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

        /**
         * Set tank gun angle
         */
        if(typeof clientData.player.userInput.mouseAngle != 'undefined'){
            clientData.tank.gunAngle = clientData.player.userInput.mouseAngle;
        }

        /**
        * Remove any bullets that are now out of bounds.
        */
        for(var bullet of clientData.tank.bullets) {
            if(bullet.x > config.gameWidth - config.wallWidth || bullet.x < config.wallWidth || bullet.y > config.gameHeight - config.wallWidth || bullet.y < config.wallWidth){
                var playerIndex = util.findIndex(currentClientDatas,bullet.ownerId);
                if(playerIndex > -1) {
                    var bulletIndex = util.findIndex(currentClientDatas[playerIndex].tank.bullets, bullet.id);
                    currentClientDatas[playerIndex].tank.bullets.splice(bullet.id,1);
                    this.quadtree.remove(bullet.forQuadtree(), 'id');
                }
            }
        }

        /**
        * Check any collisions on tank
        */
        var objectsInTankArea = this.quadtree.get(clientData.tank.forQuadtree());
            for(var objectInTankArea of objectsInTankArea){
                if(objectInTankArea.type === 'BULLET'){
                    var bullet = objectInTankArea.object;
                    var playerIndex = util.findIndex(currentClientDatas,bullet.ownerId);
                if(playerIndex > -1) {
                    var bulletIndex = util.findIndex(currentClientDatas[playerIndex].tank.bullets, bullet.id);
                    currentClientDatas[playerIndex].tank.bullets.splice(bullet.id,1);
                    this.quadtree.remove(bullet.forQuadtree(), 'id');
                }
            }
        };
    }
}

module.exports = GameLogicService;