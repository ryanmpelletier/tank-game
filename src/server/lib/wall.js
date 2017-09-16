/**
 * Wall object, for now will just be used for the game barriers.
 * Default wall is a square 25 * 25;
 */
var config = require('../../../config.json');
const crypto = require("crypto");


class Wall {
    constructor(x, y, w = 25, h = 25){

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.id = crypto.randomBytes(16).toString("hex");

        this.forQuadtree = function(){
            return {
                x: this.x,
                y: this.y,
                w: this.w,
                h: this.h,
                id:this.id,
                type:'WALL',
                object: this
            }
        };
    }
}

module.exports = Wall;