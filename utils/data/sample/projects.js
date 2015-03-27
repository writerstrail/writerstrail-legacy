var calcPercent = function (wc, target) {
  return Math.max(0, Math.min(100, Math.floor((wc / target) * 100)));
};

module.exports = [
  {
    id: 0,
    name: 'Ender\'s Game',
    wordcount: 0,
    charcount: 0,
    currentWordcount: 100609,
    currentCharcount: 545346,
    targetwc: 100000,
    targetcc: 550000,
    percentage: calcPercent(100609, 100000),
    active: true,
    finished: true,
    sessions: []
  },
  {
    id: 0,
    name: 'Moby Dick',
    wordcount: 0,
    charcount: 0,
    currentWordcount: 45678,
    currentCharcount: 0,
    targetwc: 55000,
    targetcc: 0,
    percentage: calcPercent(45678, 55000),
    active: true,
    finished: false,
    sessions: []
  },
  {
    id: 0,
    name: 'Brave New World',
    wordcount: 0,
    charcount: 0,
    currentWordcount: 40000,
    currentCharcount: 150000,
    targetwc: 100000,
    targetcc: 400000,
    percentage: calcPercent(40000, 100000),
    active: true,
    finished: false,
    sessions: []
  },
  {
    id: 0,
    name: 'To Kill a Mockingbird',
    wordcount: 0,
    charcount: 0,
    currentWordcount: 12345,
    currentCharcount: 65034,
    targetwc: 120000,
    targetcc: 650000,
    percentage: calcPercent(12345, 120000),
    active: true,
    finished: false,
    sessions: []
  }
];