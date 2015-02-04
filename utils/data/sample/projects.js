var calcPercent = function (wc, target) {
  return Math.max(0, Math.min(100, Math.floor((wc / target) * 100)));
};

module.exports = [
  {
    id: 0,
    name: 'Moby Dick',
    wordcount: 0,
    currentWordcount: 45678,
    targetwc: 55000,
    percentage: calcPercent(45678, 55000),
    active: true,
    finished: false,
    sessions: []
  },
  {
    id: 0,
    name: 'Brave New World',
    wordcount: 0,
    currentWordcount: 40000,
    targetwc: 100000,
    percentage: calcPercent(40000, 100000),
    active: true,
    finished: false,
    sessions: []
  },
  {
    id: 0,
    name: 'To Kill a Mockinbird',
    wordcount: 0,
    currentWordcount: 12345,
    targetwc: 120000,
    percentage: calcPercent(12345, 120000),
    active: true,
    finished: false,
    sessions: []
  }
];