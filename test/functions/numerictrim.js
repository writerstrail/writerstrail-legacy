var numerictrim = require('../../utils/functions/numerictrim');

describe('numerictrim function', function () {
  it('should correctly pass a number', function () {
    var test = 123,
        result = numerictrim(test);

    expect(result).to.be.equal(123);
    expect(result).to.be.a('number');
  });

  it('should correctly pass a numeric string', function () {
    var test = '123',
      result = numerictrim(test);

    expect(result).to.be.equal(123);
    expect(result).to.be.a('number');
  });

  it('should strip whitespaces', function () {
    var test = '   1 23 ',
      result = numerictrim(test);

    expect(result).to.be.equal(123);
  });

  it('should keep negative values', function () {
    var test = '-123',
      result = numerictrim(test);

    expect(result).to.be.equal(-123);
  });

  it('should accept commas', function () {
    var test = '123,456',
      result = numerictrim(test);

    expect(result).to.be.equal(123456);
  });

  it('should round down floats', function () {
    var test = '123.999',
      result = numerictrim(test);

    expect(result).to.be.equal(123);
  });

  it('should return null when not ok', function () {
    var test = null,
      result = numerictrim(test);

    expect(result).to.be.null;

    test = false;
    result = numerictrim(test);

    expect(result).to.be.null;

    test = '';
    result = numerictrim(test);

    expect(result).to.be.null;
  });

  it('should correctly return zero', function () {
    var test = '0',
      result = numerictrim(test);

    expect(result).to.be.equal(0);

    test = 0;
    result = numerictrim(test);

    expect(result).to.be.equal(0);
  });
});
