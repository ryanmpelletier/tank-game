/**
 * Bullets will need to have an id that is unique as well, but
 */
var config = require('../../../config.json');
const crypto = require("crypto");


class Bullet {
    constructor(ownerId, x, y, velocityX = 0, velocityY = 0){
        this.id = crypto.randomBytes(16).toString("hex");
        this.ownerId = ownerId;
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.wallsInsideOf = [];
        this.timeCreated = new Date().getTime();

        this.forQuadtree = function(){
            return {
                x: this.x,
                y: this.y,
                w: config.bullet.width,
                h: config.bullet.height,
                id: this.id,
                type:'BULLET',
                object: this
            }
        };
    }
}

module.exports = Bullet;