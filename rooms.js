// this module registers room names and ips.
var redis = require("redis"),
    client = redis.createClient();

console.log("redis client connecting...");

// error logging
client.on("error", function(err) {
  console.log("redis error: " + err);
});

// a user with ip `ip_addr` connected. create new room and return
// the room name, or, if room exists already return the existing
// name.
// SCHEMA: ip keys are like ip:192.168.1.1
//         room names are like room:room_name
function getRoom(ipAddress, callback) {
  // does the key exist? if not then make new room
  // otherwise get the existing room
  var key = "ip:" + ipAddress;
  client.get(key, function(err, reply) {
    if (reply) {
      // return the room name
      callback(reply);
    } else {
      // get a random room from available rooms, pop it and add to
      // rooms:taken and register the ip to that room
      client.spop("rooms:available", function(err, newRoom) {
        callback(newRoom);
        client.sadd("rooms:taken", newRoom);
        client.set(key, newRoom);
      });
    }
  });
}

function addMessage(room, message) {
  var key = "history:" + room;
  client.rpush(key, JSON.stringify(message));
}

exports.getRoom = getRoom;
exports.addMessage = addMessage;
