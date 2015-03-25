module.exports = function wordCounter(text) {
  if (!text) {
    return null;
  }
  return text.toString().trim().length;
};
