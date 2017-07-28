var expect = require('chai').expect;
var SimpleQuadtree = require('simple-quadtree');


describe('quadtree.js', function () {

    function random (low, high) {
        return Math.random() * (high - low) + low;
    }
    //I need to figure out how to give the objects an identifying attribute
    var quadtree = new SimpleQuadtree(0,0,1000,1000);

    var coordinates = [];
    for(var i = 0; i < 1000; i++){
        var randX = random(0,1000);
        var randY = random(0,1000);
        coordinates.push({x:randX, y:randY, w:1, h:1});
    }

    for(var i = 0; i < coordinates.length; i++){
        quadtree.put(coordinates[i]);
    }


    var errors = [];
    var successes = [];
    for(var i = 0; i < coordinates.length; i++){
        if(!quadtree.update(coordinates[i],"id",{x:1,y:1,w:1,h:1})){
            errors.push(coordinates[i]);
        }else {
            successes.push(coordinates[i]);
        }
    }

    console.log("Errors", errors.length);
    console.log("Successes", successes.length);
});
