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