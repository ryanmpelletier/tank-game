/**
 * Wall object, for now will just be used for the game barriers.
 */
var config = require('../../../config.json');
const crypto = require("crypto");


class Wall {
    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.forQuadtree = function(){
            return {
                x: this.x,
                y: this.y,
                w: this.w,
                h: this.h,
                type:'WALL',
                object: this
            }
        };
    }
}

module.exports = Wall;