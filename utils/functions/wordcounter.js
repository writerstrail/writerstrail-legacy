var _ = require('lodash');

module.exports = function wordCounter(text) {
  if (!text) { return null; }
  var words = text
  .replace(/[.,;–—?!-]/g, ' ') // remove punctuation and new lines
  .replace(/\s+/g, ' ') // condense spaces
  .split(' '); // split by spaces

  words = _.filter(words);

  return words.length;

};
