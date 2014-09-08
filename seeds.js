// this script should define some adjectives and nouns for
// room names and add any new combinations to the redis instance.
// DEPENDENCIES
var redis = require("redis"),
    client = redis.createClient();

console.log("starting up redis client...");

// loads list from json file
var adjectives = [
  // A
  "able",
  "acute",
  "added",
  "agape",
  "aged",
  "alpha",
  "ample",
  "awful",
  "azure"
];
var nouns = [
  // A
  "abbey",
  "abode",
  "abbot",
  "abyss",
  "acorn",
  "actor",
  "adage",
  "adieu",
  "agent",
  "aisle",
  "alert",
  "alley",
  "altar",
  "anvil",
  "apple",
  "apron",
  "army",
  "array",
  "arson",
  "atlas",
  "attic",
  "axis",
  "axon",
];

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

    // now go through every adj-noun combination and, if
    // not in takenRoomNames, add to rooms:available
    for (var k = 0; k < adjectives.length; k++) {
      for (var l = 0; l < nouns.length; l++) {
        var roomName = adjectives[k] + "-" + nouns[l];
        if (roomName in takenRoomNames) {
          // don't do anything
        } else {
          client.sadd("rooms:available", roomName, function(err, reply3) {
            console.log("added");
          });
        }
      }
    }
  });
});
