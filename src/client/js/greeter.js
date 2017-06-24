/**
 * Note that this is client code, but it still uses module.exports! Webpack lets us do that, because it sees the
 * dependencies and wires it all together when it builds our single client JS file.
 * 
 * This also uses JS classes, which is an ES6 feature. In our build process specified in gulpfile.js, Babel turns this 
 * cool new code into compatible JS for older browsers.
 */


class Greeter {
  constructor() {
    this.greeting = "Hello from the greeter!";
  }

  greet() {
    console.log(this.greeting);
  }
}

module.exports = Greeter;