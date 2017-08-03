/**
 * Created by dnd on 7/21/17.
 */
class Sprite {
    constructor(width = 0, height = 0, ticksPerFrame = 0,
                rowFrameCount = 1, colFrameCount = 1,
                rowFrameIndex = 0, colFrameIndex = 0) {
        this.width = width;
        this.height = height;
        this.rowFrameCount = rowFrameCount;
        this.colFrameCount = colFrameCount;
        this.ticksPerFrame = ticksPerFrame;
        this.rowFrameIndex = rowFrameIndex;
        this.colFrameIndex = colFrameIndex;
        this.tickCount = 1;
    }

    update() {
        this.tickCount += 1;

        // Check if time to update frame
        if (this.tickCount > this.ticksPerFrame) {
            // Reset tick count
            this.tickCount = 0;

            this.colFrameIndex = ((this.colFrameIndex + 1) % this.colFrameCount);
        }
    };

    static render(sprite, context, image, destX, destY, radians = 0) {
        // Save current context to prevent rotating everything drawn after this occurs
        context.save();

        // Move registration point to tank's position
        context.translate(destX, destY);

        // Rotate entire canvas desired amount for tank's hull to rotate
        // (rotates around axis at tank's current location)
        context.rotate(radians);

        // Move registration point back to the top left corner of canvas
        // (necessary otherwise tank is drawn at wrong location since canvas has been rotated)
        context.translate(-destX, -destY);

        var singleFrameWidth = sprite.width / sprite.rowFrameCount;
        var singleFrameHeight = sprite.height / sprite.colFrameCount;

        // Draw tank sprite at destination coordinates
        context.drawImage(
            image,
            sprite.rowFrameIndex * singleFrameWidth,
            sprite.colFrameIndex * singleFrameHeight,
            sprite.width / sprite.rowFrameCount,
            sprite.height / sprite.colFrameCount,
            destX - (singleFrameWidth / 2) * (typeof sprite.scaleFactorHeight == 'undefined' ? 1 : sprite.scaleFactorHeight),
            destY - (singleFrameHeight / 2) * (typeof sprite.scaleFactorWidth == 'undefined' ? 1 : sprite.scaleFactorWidth),
            singleFrameWidth * (typeof sprite.scaleFactorWidth == 'undefined' ? 1 : sprite.scaleFactorWidth),
            singleFrameHeight * (typeof sprite.scaleFactorHeight == 'undefined' ? 1 : sprite.scaleFactorHeight)
        );

        context.restore();
    };
}

module.exports = Sprite;