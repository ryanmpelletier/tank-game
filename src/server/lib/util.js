exports.findIndex = function(arr, id) {
    var len = arr.length;

    while (len--) {
        if (arr[len].id === id) {
            return len;
        }
    }

    return -1;
};

exports.areCoordinatesEqual = function(coor1, coor2) {
    return (coor1.x == coor2.x && coor1.y == coor2.y);
};

/**
 * Draws a rotated rectangle.
 *
 * @param context
 *          The HTML5 drawing context.
 * @param x
 *          The x coordinate (top-left corner of rectangle).
 * @param y
 *          The y coordinate (top-left corner of rectangle).
 * @param width
 *          The width of the rectangle.
 * @param height
 *          The height of the rectangle.
 * @param angleInRadians
 *          The angle in radians to rotate the rectangle.
 */
exports.drawRotatedRect = function(context, x, y, width, height, angleInRadians) {
    context.save();

    // Move registration point to center of shape's position
    context.translate(x + width / 2, y + height / 2);

    // Rotate entire canvas desired amount around shape's center axis
    context.rotate(angleInRadians);

    // Move registration point back to the top left corner of canvas
    // (necessary otherwise shape is drawn at wrong location since canvas has been rotated)
    context.translate(-(x + width / 2), -(y + height / 2));

    // Draw shape
    context.fillRect(x, y, width, height);

    context.restore();
};