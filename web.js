var app = require('express')();
var logfmt = require("logfmt");
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(logfmt.requestLogger());

// Serve index.html
app.get('/', function(req, res){
  res.sendFile('index.html', {root: __dirname});
});

io.on('connection', function(socket){
  console.log('a user connected');
});

// Start the server
var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
