/**
 * Webpack is used to bundle our client resources together into one .js file. It is called a module bundler.
 * It lets us use node-style module exporting and importing in our client code, which is really nice!
 * 
 * Below
 *  "entry" tells Webpack where to create the root of the dependency graph it builds. Its basically the main JS file. 
 *  "output" tells Webpack where to put the bundled file, and what to call it. Here we see it is put into /bin/client/js and named app.js.
 */

module.exports = {
  entry: './src/client/js/app.js',
  output: {
    path: require("path").resolve("./bin/client/js"),
    library: "app",
    filename: "app.js"
  },
};