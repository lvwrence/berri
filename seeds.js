// this script should define some adjectives and nouns for
// room names and add any new combinations to the redis instance.
// DEPENDENCIES
var redis = require("redis"),
    client = redis.createClient();
var fs = require("fs");

console.log("starting up redis client...");

var content = fs.readFileSync("berri-uncommon");
content = content.toString();

var words = content.replace(/\n/g, " ").split(" ");
words.pop();

var takenRoomNames = {};
client.smembers("rooms:available", function(err, reply) {
  // add rooms from rooms:available to takenRooms
  for (var i = 0; i < reply.length; i++) {
    takenRoomNames[reply[i]] = true;
  }
  client.smembers("rooms:taken", function(err, reply2) {
    // add rooms from rooms:taken to takenRooms
    for (var j = 0; j < reply2.length; j++) {
      takenRoomNames[reply2[j]] = true;
    }

    // if word not in takenRoomNames, add to rooms:available
    for (var k = 0; k < words.length; k++) {
      var roomName = words[k];
      if (roomName in takenRoomNames) {
        // don't do anything
      } else {
        client.sadd("rooms:available", roomName, function(err, reply3) {
          console.log("added");
        });
      }
    }
  });
});
