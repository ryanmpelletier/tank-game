/**
 * A gulpfile is what the "gulp" command looks at in order to build the project. Gulp has lots of "tasks"
 * which each do something, and in some cases depend on other tasks being complete. 
 * 
 * A special task is used in this file to watch for source code changes, and rebuild the server on a save.  
 */

var gulp = require('gulp');
var babel = require('gulp-babel');
var webpack = require('webpack-stream');
var nodemon = require('gulp-nodemon');
var mocha = require('gulp-mocha');



/**
 * This tasks pipes our test files through mocha to run automated tests.
 */
gulp.task('test',function(){
    gulp.src(['test/**/*.js'])
        .pipe(mocha());
});




/**
 * This task moves everything EXCEPT for the js files over from src/client to /bin/client.
 * We do not move over js files because wepback is going to bundle up our js files and move that to the /bin/client/js folder
 * 
 */
gulp.task('move-client', function(){
    return gulp.src(['src/client/**/*.*', '!src/client/js/*.js'])
        .pipe(gulp.dest('./bin/client/'));
});

/**
 * 
 * This task depends on 'move-client', so 'move-client' will run first.
 * 
 * This allows webpack to bundle our client side JS, and then it runs that output through babel,
 * which converts cool es6 features to JS older browsers can understand. 
 * 
 * Lastly the output is put into bin/client/js in one JS file!
 * 
 */
gulp.task('build-client', gulp.series('move-client', function(){
    return gulp.src('src/client/js/app.js')
        .pipe(webpack(require('./webpack.config.js')))    
        .pipe(babel({
            presets: [
                ['es2015', { 'modules': false }]
            ]
        }))
        .pipe(gulp.dest('bin/client/js/'));
}));

/**
 * Grabs all the files in /src/server and puts them in /bin/server after running babel on them,
 * this depends on the client already being built, so 'build-client' is run first
 */
gulp.task('build-server', gulp.series('build-client', function () {
  return gulp.src(['src/server/**/*.*', 'src/server/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('bin/server/'));
}));


/**
 * Uses nodemon plugin to start server
 * script tells it where the node file is to run
 * 
 * Although it is not explicitely stated, nodemon is watching the directory where the server code is for changes
 * and will restart the server once it finds new changes. 
 * (So gulp watches the source code changes, and nodemon is watching for new builds to know when to restart the server)
 * 
 * NOTE: you can type rs and hit <enter> in the console at any time to restart the server
 */
gulp.task('run', gulp.series('build-server', function () {
    nodemon({
        delay: 1000,
        nodeArgs: ['--inspect'],
        script: './bin/server/server.js',
    })
    .on('restart',function(){
        console.log("restarted");
    });
}));

/**
 * Any time a source file is changed, run the 'build-server' task
 */
gulp.task('watch', function() {
    gulp.watch('src/**/*',['build-server']);
});


/**
 * Default gulp task, if just 'gulp' is run in the project root directory, this task will run.
 * Watch is also called to watch for source code changes, and call build-server when necessary
 */
gulp.task('default', gulp.series('run', 'watch'));
