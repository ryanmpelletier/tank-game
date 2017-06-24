/**
 * Note that this is client code, but it still uses require! Webpack lets us do that, because it sees the
 * dependencies and wires it all together when it builds our single client JS file.
 */

var Greeter = require('./greeter');

(function(){
    var greeter = new Greeter();
    greeter.greet();
})();