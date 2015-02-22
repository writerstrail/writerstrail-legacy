module.exports = function durationformatter(dur) {
  if (dur === null) { return null; }
  var min = Math.floor(dur / 60),
    sec = dur - min * 60;
  
  return (min.toString() +  ':' + (sec < 10 ? '0' + sec : sec));
};