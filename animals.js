var animals = [
  "Aardvark",
  "Albatross",
  "Alligator",
  "Alpaca",
  "Ant",
  "Anteater"];

function rand_animal() {
  return animals[Math.floor(Math.random() * animals.length)];
}

exports.get_animal_name = rand_animal;
