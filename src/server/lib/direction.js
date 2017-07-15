/**
 * Class for representing a direction in degrees.
 *
 * @author dderuiter
 * @date 07/15/2017
 */

const DIRECTION_NORTH = 0;
const DIRECTION_NORTH_EAST = 45;
const DIRECTION_EAST = 90;
const DIRECTION_SOUTH_EAST = 135;
const DIRECTION_SOUTH = 180;
const DIRECTION_SOUTH_WEST = 225;
const DIRECTION_WEST = 270;
const DIRECTION_NORTH_WEST = 315;

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