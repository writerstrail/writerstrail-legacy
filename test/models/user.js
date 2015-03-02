var User = models.User;
var bcrypt = require('bcrypt');

describe('User model', function () {
  var junk = [];
  var id, now;
  
  before(function (done) {
    id = 1000;
    now = moment(now).set('milliseconds', 0).toDate();
    done();
  });
  
  it('should correctly save a user', function (done) {
    id += 1;
    
    User.create({
      id: id,
      name: 'Test ok',
      email: 'ok@example.com',
      verifiedEmail: 'ok@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      role: 'user',
      lastAccess: now,
      invitationCode: 'code',
      facebookId: 'some id',
      facebookEmail: 'some_mail@example.com',
      facebookName: 'Test ok',
      facebookToken: 'token',
      googleId: 'some id',
      googleEmail: 'some_mail@example.com',
      googleName: 'Test ok',
      googleToken: 'token',
      linkedinId: 'some id',
      linkedinEmail: 'some_mail@example.com',
      linkedinName: 'Test ok',
      linkedinToken: 'token',
      wordpressId: 'some id',
      wordpressEmail: 'some_mail@example.com',
      wordpressName: 'Test ok',
      wordpressToken: 'token'
    }).then(function () {
      return User.findOne(id);
    }).then(function (user) {
      junk.push(user);
      
      try {
        expect(user).to.have.property('name', 'Test ok');
        expect(user).to.have.property('email', 'ok@example.com');
        expect(user).to.have.property('verifiedEmail', 'ok@example.com');
        expect(user).to.have.property('password').that.match(/^\$2a\$10\$/);
        expect(user).to.have.property('activated', true);
        expect(user).to.have.property('verified', true);
        expect(user).to.have.property('role', 'user');
        expect(user).to.have.property('lastAccess').that.is.equalTime(now);
        expect(user).to.have.property('invitationCode', 'code');
        expect(user).to.have.property('facebookId', 'some id');
        expect(user).to.have.property('facebookEmail', 'some_mail@example.com');
        expect(user).to.have.property('facebookName', 'Test ok');
        expect(user).to.have.property('facebookToken', 'token');
        expect(user).to.have.property('googleId', 'some id');
        expect(user).to.have.property('googleEmail', 'some_mail@example.com');
        expect(user).to.have.property('googleName', 'Test ok');
        expect(user).to.have.property('googleToken', 'token');
        expect(user).to.have.property('linkedinId', 'some id');
        expect(user).to.have.property('linkedinEmail', 'some_mail@example.com');
        expect(user).to.have.property('linkedinName', 'Test ok');
        expect(user).to.have.property('linkedinToken', 'token');
        expect(user).to.have.property('wordpressId', 'some id');
        expect(user).to.have.property('wordpressEmail', 'some_mail@example.com');
        expect(user).to.have.property('wordpressName', 'Test ok');
        expect(user).to.have.property('wordpressToken', 'token');
      } catch (err) {
        done(err);
      }
      return models.Settings.findOne(id);
    }).then(function (settings) {
      try {
        expect(settings).to.exist;
      } catch (err) {
        done(err);
      }
      return models.Genre.findAll({
        where: {
          ownerId: id
        }
      });
    }).then(function (genres) {
      try {
        
        expect(genres).to.be.an('array');
        expect(genres).to.have.length.of.at.least(1);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should not allow no name', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      email: 'testnoname@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      role: 'user',
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(user).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'name');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null name', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: null,
      email: 'testnullname@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      role: 'user',
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(user).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'name');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow empty name', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: '',
      email: 'testemptyname@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      role: 'user',
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(user).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'name');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should truncate name with more than 255 characters', function (done) {
    var user, err;
    var name = genString(256);
    
    id += 1;
    
    User.create({
      id: id,
      name: name,
      email: 'testnoname@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      role: 'user',
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user).to.have.property('name', name.slice(0, 255));
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow invalid email', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test invalid email',
      email: 'obviously invalid email',
      password: 'nicepassword',
      activated: true,
      verified: true,
      role: 'user',
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(user).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'email');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow no email', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'test no email',
      password: 'nicepassword',
      activated: true,
      verified: true,
      role: 'user',
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(user).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'email');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null email', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test null email',
      email: null,
      password: 'nicepassword',
      activated: true,
      verified: true,
      role: 'user',
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(user).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'email');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
    
  it('should set "user" if no role is provided', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test no role',
      email: 'testnorole@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user).to.have.property('role', 'user');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
    
  it('should not allow empty role', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test empty role',
      email: 'testempty@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      role: '',
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(user).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'role');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow empty password', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test empty pass',
      email: 'testemptypass@example.com',
      password: '',
      activated: true,
      verified: true,
      role: 'user',
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(user).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'password');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow password with less than 8 characters', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test short pass',
      email: 'testshortpass@example.com',
      password: '1234567',
      activated: true,
      verified: true,
      role: 'user',
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(user).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'password');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should hash password on bulk create with individual hooks', function (done) {
    var user, err;
    
    id += 1;
    
    User.bulkCreate([{
      id: id,
      name: 'Test bulk create hash ind hooks',
      email: 'testbulkcreatehashindhooks@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      lastAccess: now
    }], {
      individualHooks: true
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user).to.have.property('password').that.match(/^\$2a\$10\$/);
        expect(user).to.have.property('password').that.satisfy(function (pass) { return bcrypt.compareSync('nicepassword', pass); });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should hash password on bulk create', function (done) {
    var user, err;
    
    id += 1;
    
    User.bulkCreate([{
      id: id,
      name: 'Test bulk create hash',
      email: 'testbulkcreatehash@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      lastAccess: now
    }]).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user).to.have.property('password').that.match(/^\$2a\$10\$/);
        expect(user).to.have.property('password').that.satisfy(function (pass) { return bcrypt.compareSync('nicepassword', pass); });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not hash password if null on bulk create', function (done) {
    var user, err;
    
    id += 1;
    
    User.bulkCreate([{
      id: id,
      name: 'Test bulk create hash',
      email: 'testbulkcreatehash@example.com',
      password: null,
      activated: true,
      verified: true,
      lastAccess: now
    }]).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user).to.have.property('password').that.is.null;
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should hash password on update', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test update hash',
      email: 'testupatehash@example.com',
      password: 'oldpassword',
      activated: true,
      verified: true,
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
      
      user.password = 'newpassword';
      return user.save();
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user).to.have.property('password').that.match(/^\$2a\$10\$/);
        expect(user).to.have.property('password').that.satisfy(function (pass) { return bcrypt.compareSync('newpassword', pass); });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should hash password on bulk update', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test bulk update hash',
      email: 'testbulkupdatehash@example.com',
      password: 'oldpassword',
      activated: true,
      verified: true,
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      
      return User.update({
        password: 'newpassword'
      }, {
        where: {
          id: id
        }
      });
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user).to.have.property('password').that.match(/^\$2a\$10\$/);
        expect(user).to.have.property('password').that.satisfy(function (pass) { return bcrypt.compareSync('newpassword', pass); });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should hash password on bulk update with individual hooks', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test bulk update hash ind hooks',
      email: 'testbulkupdatehashindhooks@example.com',
      password: 'oldpassword',
      activated: true,
      verified: true,
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      
      return User.update({
        password: 'newpassword'
      }, {
        where: {
          id: id
        },
        individualHooks: true
      });
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user).to.have.property('password').that.match(/^\$2a\$10\$/);
        expect(user).to.have.property('password').that.satisfy(function (pass) { return bcrypt.compareSync('newpassword', pass); });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
    
  it('should not re-hash the password if not updated', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test update rehash',
      email: 'testupaterehash@example.com',
      password: 'oldpassword',
      activated: true,
      verified: true,
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
      
      user.name = 'Test update rehash name change';
      return user.save();
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user).to.have.property('password').that.match(/^\$2a\$10\$/);
        expect(user).to.have.property('password').that.satisfy(function (pass) { return bcrypt.compareSync('oldpassword', pass); });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not re-hash the password if not updated on bulk', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test bulk update re-hash',
      email: 'testbulkupdaterehash@example.com',
      password: 'oldpassword',
      activated: true,
      verified: true,
      lastAccess: now
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      
      return User.update({
        name: 'Test bulk update re-hash name change'
      }, {
        where: {
          id: id
        }
      });
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user).to.have.property('password').that.match(/^\$2a\$10\$/);
        expect(user).to.have.property('password').that.satisfy(function (pass) { return bcrypt.compareSync('oldpassword', pass); });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  //projects, genres, targets, settings, tokens, oauth models
  it('should associate with related models', function (done) {
    var hasMany = sinon.stub(User, 'hasMany'),
      hasOne = sinon.stub(User, 'hasOne'),
      hook = sinon.stub(User, 'hook');
    
    User.associate(models);
    
    hasMany.restore();
    hasOne.restore();
    hook.restore();
    
    try {
      expect(hasOne).to.have.been.calledOnce;
      expect(hasOne).to.have.been.calledWith(models.Settings);
      expect(hasMany).to.have.been.callCount(8);
      expect(hasMany).to.have.been.calledWith(models.Project);
      expect(hasMany).to.have.been.calledWith(models.Genre);
      expect(hasMany).to.have.been.calledWith(models.Target);
      expect(hasMany).to.have.been.calledWith(models.Token);
      expect(hasMany).to.have.been.calledWith(models.OauthClient);
      expect(hasMany).to.have.been.calledWith(models.OauthAccessToken);
      expect(hasMany).to.have.been.calledWith(models.OauthAuthCode);
      expect(hasMany).to.have.been.calledWith(models.OauthRefreshToken);
      done();
    } catch (e) {
      done(e);
    }
  });
  
  it('should accept a valid password', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test valid password',
      email: 'testvalidpassword@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      lastAccess: now,
      role: 'user'
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user.validPassword('nicepassword'), 'valid password').to.be.true;
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should reject an invalid password', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test invalid password',
      email: 'testinvalidpassword@example.com',
      password: 'nicepassword',
      activated: true,
      verified: true,
      lastAccess: now,
      role: 'user'
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user.validPassword('notnicepassword'), 'valid password').to.be.false;
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should reject null password', function (done) {
    var user, err;
    
    id += 1;
    
    User.create({
      id: id,
      name: 'Test valid password',
      email: 'testvalidpassword@example.com',
      password: null,
      activated: true,
      verified: true,
      lastAccess: now,
      role: 'user'
    }).then(function () {
      return User.findOne(id);
    }).then(function (u) {
      junk.push(u);
      user = u;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(user.validPassword(null), 'valid password').to.be.false;
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  //cleanJunk(junk, after);
});