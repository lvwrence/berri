// DEPENDENCIES
// base dependencies
var logfmt = require("logfmt");
var express = require("express");
var bodyParser = require('body-parser');
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
// for parsing body for post params
app.use(bodyParser.urlencoded({ extended: false }));

// SERVER
// serve static assets
app.use("/static", express.static(__dirname + "/public"));
// a user visited root
app.get("/", function(req, res) {
  var ip = req.ip;
  console.log("a user visited root with ip " + ip);
  rooms.doesRoomExist(ip, function(exists) {
    if (exists) {
      rooms.getRoom(ip, function(room) {
        res.redirect(room);
      });
    } else {
      res.sendFile("public/index.html", {"root": __dirname});
    }
  });
});

// a user visited root
app.post("/", function(req, res) {
  rooms.createRoom(req.ip, req.body.privacy, function(room) {
    res.redirect(room);
  });
});

// a user visited something other than root
// (probably a room)
app.get("*", function(req, res) {
  var ip = req.ip;
  var path = req.path.replace("/", "");
  // check path of room and see whether room is privacy
  rooms.roomPrivacy(path, function(privacy) {
    // if privacy, only let user in if the ip related
    // to him is the room's
    if (privacy == "private") {
      rooms.getRoom(ip, function(room) {
        if (room == path) {
          res.sendFile("public/chat.html", {"root": __dirname});
        } else {
          res.send("Sorry, but you're not allowed.");
        }
      });
    // if it's public, doesn't matter
    } else if (privacy == "public") {
      res.sendFile("public/chat.html", {"root": __dirname});
    } else {
      // room is not defined yet
      res.send("This room has not been created yet.");
    }
  });
});

// SOCKET
// a user connected
io.on("connection", function(socket) {
  // this is the room name (pathname)
  var room = socket.handshake.headers.referer.split("/").slice(-1)[0];
  // get a random animal username
  var username = animals.getAnimalName();
  console.log("a user with ip " + socket.handshake.address.address + " connected to room " + room);
  socket.join(room);
  // emit a join
  io.to(room).emit("join", username);

  // initialize the user with a random animal username and possibly other stuff later (get existing chat?)
  console.log("initializing user...");
  rooms.getData(room, function(users, messages) {
    var user = username;
    var users = users;
    var ip = socket.handshake.address.address;
    var messageHistory = messages.map(JSON.parse);
    socket.emit("initialize", {
      username: username,
      users: users,
      ip: ip,
      messages: messageHistory
    });
    // add user to room in redis (have to do it here
    // since we manually put username in client so
    // it won't appear twice)
    rooms.addUser(room, username);
  });

  // on receiving a message from the user
  socket.on("message", function(msg) {
    io.to(room).emit("message", msg);
    console.log(msg.author + " said " + msg.text + " in room " + room);
    rooms.addMessage(room, msg);
  });

  // on user disconnect
  socket.on("disconnect", function() {
    io.to(room).emit("quit", username);
    rooms.removeUser(room, username);
  });
});
