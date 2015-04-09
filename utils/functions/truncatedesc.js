function truncatedesc(desc, amount) {
  amount = amount || 50;
  if (!desc) {
    return '';
  }
  if (desc.toString().length <= amount) {
    return desc;
  }
  return (desc.slice(0, Math.max(0, amount - 3)) + '...');
}

module.exports = truncatedesc;
