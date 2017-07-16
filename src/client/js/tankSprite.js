class TankSprite {
    constructor(options){
        this.width = options.width;
        this.height = options.height;
        this.numberOfFrames = options.numberOfFrames || 1;
        this.ticksPerFrame = options.ticksPerFrame || 0;

        this.frameIndex = 0;
        this.tickCount = 0;

        this.context = options.context;

        this.image = new Image();
        this.image.src = "/img/tank-sprite.png";
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
		
    render(destX, destY, hullDirection) {
        // Save current context to prevent rotating everything drawn after this occurs
        this.context.save();

        // Move registration point to tank's position
        this.context.translate(destX, destY);

        // Rotate entire canvas desired amount for tank's hull to rotate
        // (rotates around axis at tank's current location)
        this.context.rotate(hullDirection * Math.PI / 180);

        // Move registration point back to the top left corner of canvas
        // (necessary otherwise tank is drawn at wrong location since canvas has been rotated)
        this.context.translate(-destX, -destY);

        // Draw tank sprite at destination coordinates
        this.context.drawImage(
            this.image,
            this.frameIndex * this.width / this.numberOfFrames,
            0,
            this.width / this.numberOfFrames,
            this.height,
            destX - 64,
            destY - 64,
            this.width / this.numberOfFrames,
            this.height
        );

        this.context.restore();
    };
}

module.exports = TankSprite;