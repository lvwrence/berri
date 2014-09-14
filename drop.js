var redis = require("redis"),
    client = redis.createClient();

console.log("dropping redis db...");

client.flushdb();
