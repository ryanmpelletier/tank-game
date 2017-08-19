var config = require('../../../config.json');
const crypto = require("crypto");

/**
 * Class to hold data necessary for a single tank track.
 */
class Track {
    constructor(x, y, angle) {
        this.x = x - config.trackWidth / 2;
        this.y = y - config.trackHeight / 2;
        this.angle = angle;

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

    static hasExpired(track) {
        return ++track.tickCount === Track.TIME_TO_LIVE;
    }

    static hasFinishedDelay() {
        if(++Track.globalTickCount === Track.DELAY_INTERVAL) {
            Track.globalTickCount = 1; // reset
            return true;
        }
        else {
            return false;
        }
    }
}

// Static variable creation
Track.TIME_TO_LIVE = 50;
Track.DELAY_INTERVAL = 4;
Track.globalTickCount = 0;

module.exports = Track;