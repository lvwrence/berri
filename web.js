var express = require('express');
var logfmt = require('logfmt');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// app settings
app.use(logfmt.requestLogger());
app.enable('trust proxy');

// serve index.html
app.get('/', function(req, res){
  console.log('a user visited the site with ip ' + req.ip);
  res.sendFile('index.html', {root: __dirname});
});

io.on('connection', function(socket){
  console.log('a user connected');
});

// start the server
var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log('Listening on ' + port);
});
