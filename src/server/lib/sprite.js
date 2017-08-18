/**
 * Created by dnd on 7/21/17.
 */
class Sprite {
    constructor(width = 0, height = 0, ticksPerFrame = 0,
                rowFrameCount = 1, colFrameCount = 1,
                rowFrameIndex = 0, colFrameIndex = 0) {
        this.width = width;
        this.height = height;
        this.singleFrameWidth = width / rowFrameCount;
        this.singleFrameHeight = height / colFrameCount;
        this.rowFrameCount = rowFrameCount;
        this.colFrameCount = colFrameCount;
        this.ticksPerFrame = ticksPerFrame;
        this.rowFrameIndex = rowFrameIndex;
        this.colFrameIndex = colFrameIndex;
        this.tickCount = 1;

        // Setup variables here with default values that can be overridden in subclasses for specific sprite scaling
        // (For example, these values are overridden in tankSprite to set a custom scaling factor for tanks)
        this.scaleFactorWidth = 1;
        this.scaleFactorHeight = 1;
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

        // Draw tank sprite at destination coordinates
        context.drawImage(
            image,                                                              // Specifies the image, canvas, or video element to use
            sprite.rowFrameIndex * sprite.singleFrameWidth,                     // The x coordinate where to start clipping
            sprite.colFrameIndex * sprite.singleFrameHeight,                    // The y coordinate where to start clipping
            sprite.singleFrameWidth,                                            // The width of the clipped image
            sprite.singleFrameHeight,                                           // The height of the clipped image
            destX - (sprite.singleFrameWidth / 2) * sprite.scaleFactorWidth,    // The x coordinate where to place the image on the canvas
            destY - (sprite.singleFrameHeight / 2) * sprite.scaleFactorHeight,  // The y coordinate where to place the image on the canvas
            sprite.singleFrameWidth * sprite.scaleFactorWidth,                  // The width of the image to use (stretch or reduce the image)
            sprite.singleFrameHeight * sprite.scaleFactorHeight                 // The height of the image to use (stretch or reduce the image)
        );

        context.restore();
    };
}

module.exports = Sprite;