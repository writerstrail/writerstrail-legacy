module.exports = function durationParser(dur) {
  var parts = dur.split(':', 2),
    min = parts[0] ? parseInt(parts[0], 10) : 0,
    sec = parts[1] ? parseInt(parts[1], 10) : 0,
    result = (min * 60) + sec;
  if (isNaN(result)) {
    return 0;
  }
  return result;
};