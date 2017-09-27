exports.randomId = () => {
  const VOWELS = "aeiou";
  const length = 2 + Math.floor(Math.random() * 6)
  var id = "";
  for (var ci = 0; ci < length; ci++) {
    if (ci % 2 == 0) {
      id += VOWELS[Math.floor(Math.random() * VOWELS.length)]
    } else {
      id += String.fromCharCode("a".charCodeAt(0) + Math.random() * ("z".charCodeAt(0) - "a".charCodeAt(0)));
    }
  }
  return id;
}
