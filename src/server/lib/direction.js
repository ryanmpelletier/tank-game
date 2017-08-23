/**
 * Class for representing a direction in radians.
 * Range: (0, 2 * Math.PI).
 */

const DIRECTION_EAST        = Number(0).toFixed(5);
const DIRECTION_SOUTH_EAST  = Number(Math.PI / 4).toFixed(5);
const DIRECTION_SOUTH       = Number(Math.PI / 2).toFixed(5);
const DIRECTION_SOUTH_WEST  = Number(3 * Math.PI / 4).toFixed(5);
const DIRECTION_WEST        = Number(Math.PI).toFixed(5);
const DIRECTION_NORTH_WEST  = Number(5 * Math.PI / 4).toFixed(5);
const DIRECTION_NORTH       = Number(3 * Math.PI / 2).toFixed(5);
const DIRECTION_NORTH_EAST  = Number(7 * Math.PI / 4).toFixed(5);

class Direction {

    static get N() {
        return DIRECTION_NORTH;
    }

    static get NE() {
        return DIRECTION_NORTH_EAST;
    }

    static get E() {
        return DIRECTION_EAST;
    }

    static get SE() {
        return DIRECTION_SOUTH_EAST;
    }

    static get S() {
        return DIRECTION_SOUTH;
    }

    static get SW() {
        return DIRECTION_SOUTH_WEST;
    }

    static get W() {
        return DIRECTION_WEST;
    }

    static get NW() {
        return DIRECTION_NORTH_WEST;
    }

}

module.exports = Direction;