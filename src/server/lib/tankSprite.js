
var Sprite = require('./sprite');
var config = require('../../../config.json');


class TankSprite extends Sprite {
    constructor(width = 0, height = 0, ticksPerFrame = 0,
                rowFrameCount = 1, colFrameCount = 1,
                rowFrameIndex = 0, colFrameIndex = 0) {
        super(width, height, ticksPerFrame, rowFrameCount, colFrameCount, rowFrameIndex, colFrameIndex);

        this.scaleFactorWidth = config.tank.width / (this.width / this.rowFrameCount);
        this.scaleFactorHeight = config.tank.height / (this.height / this.colFrameCount);
    }
}

module.exports = TankSprite;