// Chunks the array in parts of len length
module.exports = function chunk(arr, len) {
  var result = [],
    i = 0,
    n = arr.length;

  while (i < n) {
    result.push(arr.slice(i, i + len));
    i += len;
  }

  return result;
};