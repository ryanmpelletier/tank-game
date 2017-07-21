/**
 * Created by dnd on 7/21/17.
 */
class Sprite {

    constructor(width, height, frameCount = 1, ticksPerFrame = 0, frameIndex = 0, tickCount = 1) {
        this.width = width;
        this.height = height;
        this.numberOfFrames = frameCount;
        this.ticksPerFrame = ticksPerFrame;
        this.frameIndex = frameIndex;
        this.tickCount = tickCount;
    }

    update() {
        this.tickCount += 1;

        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;

            // If the current frame index is in range
            if (this.frameIndex < this.numberOfFrames - 1) {
                // Go to the next frame
                this.frameIndex += 1;
            }
            else {
                // Reset to first frame
                this.frameIndex = 0;
            }
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
            image,
            sprite.frameIndex * sprite.width / sprite.numberOfFrames,
            0,
            sprite.width / sprite.numberOfFrames,
            sprite.height,
            destX - 64,
            destY - 64,
            sprite.width / sprite.numberOfFrames,
            sprite.height
        );

        context.restore();
    };
}

module.exports = Sprite;