const express = require('express');
const app = express();
const path = require('path');

// Import application config
var config = require('../../config.json');

//for allowing page to access static resources
app.use('/js',express.static(path.join(__dirname, '../client/js')));
app.use('/css',express.static(path.join(__dirname, '../client/css')));
app.use('/img',express.static(path.join(__dirname, '../client/img')));


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'/../client/index.html'));
});

app.listen(config.port, function () {
    //don't forget, this code is not running in the browser, this log goes to the server environment
    console.log('Express test on port ' + config.port + '!');
});