var expect = require('chai').expect;
var SimpleQuadtree = require('simple-quadtree');


describe('quadtree.js', function () {

    //I need to figure out how to give the objects an identifying attribute
    var quadtree = new SimpleQuadtree(0,0,10,10);

    for(var i = 0; i <= 10; i++){
        for(var j = 0; j <= 10; j++){
            quadtree.put({x:i, y:j, w:0, h: 0});
        }
    }

    expect(quadtree.get({x:0, y:0, w:10, h:10}).length).to.equal(121);
});
