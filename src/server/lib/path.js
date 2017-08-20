/**
 * Models the path that a single tank will take.
 *
 * All tank tracks belong to a single path.
 * Tracks are associated with paths instead of tanks since tracks can outlive tanks.
 */
class Path {
    constructor(id) {
        this.id = id;
        this.tickCount = 0;
    }

    hasFinishedDelay() {
        if(++this.tickCount === Path.DELAY_INTERVAL) {
            this.tickCount = 0; // reset
            return true;
        }
        else {
            return false;
        }
    }
}

Path.DELAY_INTERVAL = 4;

module.exports = Path;