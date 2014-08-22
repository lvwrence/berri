// this module just returns a random username
var animals = [
  "Aardvark",
  "Albatross",
  "Alligator",
  "Alpaca",
  "Ant",
  "Anteater"];

function randAnimal() {
  return animals[Math.floor(Math.random() * animals.length)];
}

exports.getAnimalName = randAnimal;
