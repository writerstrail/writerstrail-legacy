var Token = models.Token;

describe('Token model', function () {
  var junk = [];
  var now;
  
  before(function (done) {
    now = new Date();
    done();
  });
  
  it('should correctly save a token', function (done) {
    var token, err;
    
    Token.create({
      token: 'thisisanicetoken',
      expire: now,
      data: 'anything',
      type: 'password',
      ownerId: 1
    }).then(function () {
      return Token.findOne('thisisanicetoken');
    }).then(function (t) {
      junk.push(t);
      token = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(token).to.have.property('token', 'thisisanicetoken');
        expect(token).to.have.property('expire').that.is.equalTime(now);
        expect(token).to.have.property('data', 'anything');
        expect(token).to.have.property('type', 'password');
        expect(token).to.have.property('ownerId', 1);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow the duplicate tokens', function (done) {
    var token1, token2, err;
    
    Token.create({
      token: 'thisisaduplicatetoken',
      expire: now,
      data: 'anything',
      type: 'password',
      ownerId: 1
    }).then(function () {
      return Token.findOne({
        where: {
          token: 'thisisaduplicatetoken',
          ownerId: 1
        }
      });
    }).then(function (t) {
      junk.push(t);
      token1 = t;
      
      return Token.create({
        token: 'thisisaduplicatetoken',
        expire: now,
        data: 'anything',
        type: 'password',
        ownerId: 2
      });
    }).then(function () {
      return Token.findOne({
        where: {
          token: 'thisisaduplicatetoken',
          ownerId: 1
        }
      });
    }).then(function (t) {
      junk.push(t);
      token2 = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(token2).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'token');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('type', 'unique violation');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow no owner', function (done) {
    var token, err;
    
    Token.create({
      token: 'thisisanoownertoken',
      expire: now,
      data: 'anything',
      type: 'password'
    }).then(function () {
      return Token.findOne('thisisanoownertoken');
    }).then(function (t) {
      junk.push(t);
      token = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(token).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'ownerId');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null owner', function (done) {
    var token1, token2, err;
    
    Token.create({
      token: 'thisisaduplicatetoken',
      expire: now,
      data: 'anything',
      type: 'password',
      ownerId: 1
    }).then(function () {
      return Token.findOne({
        where: {
          token: 'thisisaduplicatetoken',
          ownerId: 1
        }
      });
    }).then(function (t) {
      junk.push(t);
      token1 = t;
      
      return Token.create({
        token: 'thisisaduplicatetoken',
        expire: now,
        data: 'anything',
        type: 'password',
        ownerId: 2
      });
    }).then(function () {
      return Token.findOne({
        where: {
          token: 'thisisaduplicatetoken',
          ownerId: 1
        }
      });
    }).then(function (t) {
      junk.push(t);
      token2 = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(token2).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'token');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('type', 'unique violation');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow no owner', function (done) {
    var token, err;
    
    Token.create({
      token: 'thisisanullownertoken',
      expire: now,
      data: 'anything',
      type: 'password',
      ownerId: null
    }).then(function () {
      return Token.findOne('thisisanullownertoken');
    }).then(function (t) {
      junk.push(t);
      token = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(token).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'ownerId');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow non-existing owner', function (done) {
    var token, err;
    
    Token.create({
      token: 'thisisanon-existingownertoken',
      expire: now,
      data: 'anything',
      type: 'password',
      ownerId: 9999
    }).then(function () {
      return Token.findOne('thisisanon-existingownertoken');
    }).then(function (t) {
      junk.push(t);
      token = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(token).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('name', 'SequelizeForeignKeyConstraintError');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should associate with user', function (done) {
    var belongsTo = sinon.stub(Token, 'belongsTo');
    
    Token.associate(models);
    
    belongsTo.restore();
    
    try {
      expect(belongsTo).to.have.been.calledOnce;
      expect(belongsTo).to.have.been.calledWith(models.User);
      done();
    } catch (e) {
      done(e);
    }
  });
  
  cleanJunk(junk, after);
});