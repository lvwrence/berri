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
// room lib that uses redis
var rooms = require("./rooms");

// CONFIGURATION
// logging
app.use(logfmt.requestLogger());
// for viewing ips
app.enable("trust proxy");

// SERVER
// serve static assets
app.use('/static', express.static(__dirname + "/public"));
// a user visited root
app.get("/", function(req, res) {
  var ip = req.ip;
  console.log("a user visited root with ip " + ip);
  rooms.get_room(ip, function(room) {
    console.log("sent to room " + room);
    res.redirect(room);
  });
});
// a user visited something other than root
// (probably a room)
app.get("*", function(req, res) {
  res.sendFile('public/index.html', {"root": __dirname});
});

// SOCKET
// a user connected
io.on("connection", function(socket) {
  // this is the room name (pathname)
  var room = socket.handshake.headers.referer.split("/").slice(-1)[0];
  console.log("a user with ip " + socket.handshake.address.address + " connected to room " + room);
  socket.join(room);

  // initialize the user with a random animal username and possibly other stuff later (get existing chat?)
  console.log("initializing user with username...");
  socket.emit("initialize", {username: animals.get_animal_name(), ip: socket.handshake.address.address});

  // on receiving a message from the user
  socket.on("message", function(msg) {
    console.log(msg.author + " said " + msg.text + " in room " + room);
    io.to(room).emit("message", msg);
  });
});
