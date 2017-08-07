/**
 * This class made for the sake of modularity. Simply stores data for a particular connected client.
 * 
 * In order to protect our game from malicious user input, anything coming from the client will be stored on
 * the "player" nested object. As of right now this will include user input and the screen height and width of the client.
 * Other values as calculated by the server will be stored outside of the "player" nested object.
 */
var config = require('../../../config.json');
var TankSprite = require('./tankSprite');

class Tank {
    constructor(id, xPosition, yPosition, screenName = 'test', hullAngle = 0,
                gunAngle = 0, ammo = config.tankAmmoCapacity) {
        this.id = id;
        this.x = xPosition;
        this.y = yPosition;
        this.kills = 0;
        this.screenName = screenName;
        this._hullAngle = hullAngle;
        this._gunAngle = gunAngle;
        this.ammo = ammo;
        this.lastFireTime = undefined;

        //probably will have a bullet class
        this.bullets = [];

        this.spriteTankHull = new TankSprite(1024, 768, 4, 4, 3);
        this.spriteTankGun = new TankSprite(2048, 256, 4, 8);

        this.rotationCorrection = 0;

        /**
         * simple quadtree requires a basic format for object put onto the quadtree, I am trying to figure out the best
         * way to mitigate this I don't like a libary enforcing my object to have a certain structure, this is something
         * I am not used to. In Java this would just be an interface I would implement, and I wouldn't have to change
         * the internal representation of my object, this is my compromise
         */
        this.forQuadtree = function() {
            return {
                x: this.x - config.tankWidth/2,
                y: this.y - config.tankHeight/2,
                w: config.tankWidth,
                h: config.tankHeight,
                id: this.id,
                type:'TANK',
                object: this
            }
        };
    }

    set hullAngle(hullAngle) {
        this._hullAngle = hullAngle;

        // Convert radians to positive if negative
        hullAngle = (hullAngle + 2 * Math.PI) % (2 * Math.PI);

        // Determine correct sprite frame from angle
        this.spriteTankHull.rowFrameIndex = Math.ceil(hullAngle / (Math.PI / 4)) % 4;
    }

    set gunAngle(gunAngle) {
        this._gunAngle = gunAngle;

        // Modify gun angle window (i.e. range of degrees which a single sprite frame corresponds to)
        var modifiedGunAngle = (((gunAngle - Math.PI / 8) + 2 * Math.PI) % (2 * Math.PI));

        // Determine correct sprite frame from angle
        var frameIndex = Math.floor(modifiedGunAngle / (Math.PI / 4));
        frameIndex = Math.abs(frameIndex - 7);
        this.spriteTankGun.rowFrameIndex = frameIndex;

        // Correct gun angle
        // (i.e. gun image angle is different from mouse angle determine how much to rotate image to match mouse angle)
        var actualAngle = Math.floor(Math.abs((gunAngle * 180 / Math.PI) - 360));
        var desiredAngle = (frameIndex * 45);
        this.rotationCorrection = (actualAngle - desiredAngle) * (Math.PI / 180);
    }

    get gunAngle() {
        return this._gunAngle;
    }
}

module.exports = Tank;