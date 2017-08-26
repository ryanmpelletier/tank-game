var config = require('../../../config.json');
const crypto = require("crypto");

/**
 * Class to hold data necessary for a single tank track.
 */
class Track {
    constructor(x, y, angle, pathId) {
        this.x = x - config.track.width / 2;
        this.y = y - config.track.height / 2;
        this.angle = angle;
        this.pathId = pathId; // Not using this yet, but seems good to know what path this track is a part of

        this.width = config.track.width;
        this.height = config.track.height;

        this.id = crypto.randomBytes(16).toString("hex");
        this.tickCount = 1;

        this.forSpacialHash = function() {
            return {
                range: {
                    x: this.x,
                    y: this.y,
                    width: this.width,
                    height: this.height
                },
                type:'TRACK',
                object: this
            }
        };
    }
}

module.exports = Track;