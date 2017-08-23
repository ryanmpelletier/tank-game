var config = require('../../../config.json');
const crypto = require("crypto");

/**
 * Class to hold data necessary for a single tank track.
 */
class Track {
    constructor(x, y, angle, pathId) {
        this.x = x - config.trackWidth / 2;
        this.y = y - config.trackHeight / 2;
        this.angle = angle;
        this.pathId = pathId; // Not using this yet, but seems good to know what path this track is a part of

        this.width = config.trackWidth;
        this.height = config.trackHeight;

        this.id = crypto.randomBytes(16).toString("hex");
        this.tickCount = 1;

        this.forQuadtree = function() {
            return {
                x: this.x,
                y: this.y,
                w: this.width,
                h: this.height,
                id: this.id,
                type:'TRACK',
                object: this
            }
        };
    }

    hasExpired() {
        return ++this.tickCount === Track.TIME_TO_LIVE;
    }
}

// Static variable creation
Track.TIME_TO_LIVE = 64;

module.exports = Track;