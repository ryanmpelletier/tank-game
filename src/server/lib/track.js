var config = require('../../../config.json');
const crypto = require("crypto");

/**
 * Class to hold data necessary for a single tank track.
 */
class Track {
    constructor(x, y) {
        this.id = crypto.randomBytes(16).toString("hex");
        // this.tickCount = 1;
        // this.TIME_TO_LIVE = 100;

        this.x = x;
        this.y = y;

        this.forQuadtree = function() {
            return {
                x: this.x,
                y: this.y,
                w: 1, // TODO: use config (i.e. config.trackWidth)
                h: 1, // TODO: use config (i.e. config.trackWidth)
                id: this.id,
                type:'TRACK',
                object: this
            }
        };
    }

    // static hasExpired(tickCount) {
    //     return ++tickCount === this.TIME_TO_LIVE ? true : false;
    // }
}

module.exports = Track;