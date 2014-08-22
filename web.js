// DEPENDENCIES
// base dependencies
var logfmt = require("logfmt");
var express = require("express");
var io = require("socket.io");
// start up express server
var app = express();
var server = app.listen(8080);
// connect socket to server
var io = io.listen(server);
// list of animals for usernames
var animals = require("./animals");

// CONFIGURATION
// logging
app.use(logfmt.requestLogger());
// for viewing ips
app.enable("trust proxy");
// serve static assets
app.use(express.static(__dirname + "/public"));

// a user connected
io.on("connection", function(socket) {
  console.log("a user connected with ip " + socket.handshake.address.address);
  // initialize the user with a random animal username and possibly other stuff later (get existing chat?)
  socket.emit("init", {username: animals.get_animal_name(), ip: socket.handshake.address.address});

  // on receiving a message from the user
  socket.on("message", function(msg) {
    console.log(msg.author + " said " + msg.text);
    io.emit("message", msg);
  });
});
