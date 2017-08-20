/**
 * Class for representing a direction in radians.
 * Range: (-Math.PI, Math.PI).
 */

const DIRECTION_EAST = 0;
const DIRECTION_SOUTH_EAST = Math.PI / 4;
const DIRECTION_SOUTH = Math.PI / 2;
const DIRECTION_SOUTH_WEST = 3 * Math.PI / 4;
const DIRECTION_WEST = Math.PI;
const DIRECTION_NORTH_WEST = -(3 * Math.PI / 4);
const DIRECTION_NORTH = -(Math.PI / 2);
const DIRECTION_NORTH_EAST = -(Math.PI / 4);

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