exports.createSprite = function(options) {
	
    var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = options.ticksPerFrame || 0,
        numberOfFrames = options.numberOfFrames || 1;
    
    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.image = options.image;
    
    that.update = function () {
        tickCount += 1;

        if (tickCount > ticksPerFrame) {
            tickCount = 0;
            
            // If the current frame index is in range
            if (frameIndex < numberOfFrames - 1) {	
                // Go to the next frame
                frameIndex += 1;
            } else {
                // Reset to first frame
                frameIndex = 0;
            }
        }
    };
		
    that.render = function (destX, destY) {
        // Clear the canvas
        // that.context.clearRect(0, 0, that.width, that.height);
        
        // Draw the animation
        that.context.drawImage(
        that.image,
        frameIndex * that.width / numberOfFrames,
        0,
        that.width / numberOfFrames,
        that.height,
        destX,
        destY,
        that.width / numberOfFrames,
        that.height);
    };
    
    return that;
}