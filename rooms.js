// this module registers room names and ips.
var redis = require("redis"),
    client = redis.createClient();

console.log("redis client connecting...");

// error logging
client.on("error", function(err) {
  console.log("redis error: " + err);
});

// SCHEMA: ip keys are like ip:192.168.1.1
//         room names are like room:room_name

// check if room with ip ipAddress exists
// returns bool
function doesRoomExist(ipAddress, callback) {
  var key = "ip:" + ipAddress;
  client.exists(key, function(err, reply) {
    if (reply) {
      callback(true);
    } else {
      callback(false);
    }
  });
}

// gets the room for ip ipAddress
function getRoom(ipAddress, callback) {
  var key = "ip:" + ipAddress;
  client.get(key, function(err, reply) {
    callback(reply);
  });
}

function createRoom(ipAddress, privacy, callback) {
  // does the key exist? if not then make new room
  // otherwise get the existing room
  var key = "ip:" + ipAddress;
  // get a random room from available rooms, pop it and add to
  // rooms:taken and register the ip to that room
  client.spop("rooms:available", function(err, newRoom) {
    client.sadd("rooms:taken", newRoom);
    client.set("privacy:" + newRoom, privacy);
    client.set(key, newRoom);
    callback(newRoom); });
}

// checks whether room is private
function roomPrivacy(room, callback) {
  var key = "privacy:" + room;
  client.get(key, function(err, reply) {
    callback(reply);
  });
}

// pushes json-encoded message object to room
function addMessage(room, message) {
  var key = "history:" + room;
  client.rpush(key, JSON.stringify(message));
}

// pushes user to room
function addUser(room, user) {
  var key = "users:" + room;
  client.rpush(key, user);
}

// removes user from room
function removeUser(room, user) {
  var key = "users:" + room;
  client.lrem(key, 0, user);
}

// gets current users, message history of room
function getData(room, callback) {
  var messagesKey = "history:" + room;
  var usersKey = "users:" + room;
  client.lrange(messagesKey, 0, -1, function(err, messages) {
    client.lrange(usersKey, 0, -1, function(err, users) {
      callback(users, messages);
    });
  });
}

exports.doesRoomExist = doesRoomExist;
exports.getRoom = getRoom;
exports.createRoom = createRoom;
exports.roomPrivacy = roomPrivacy;
exports.addMessage = addMessage;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.getData = getData;
