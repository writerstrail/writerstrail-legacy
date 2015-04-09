module.exports = numericTrim;

function numericTrim (value) {
  if (!value && value !== 0) { return null; }
  value = value.toString().replace(/([^-0-9.])+/gi, '');
  return Math.floor(parseFloat(value));
}
