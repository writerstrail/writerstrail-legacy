var Session = models.Session;

describe('Session model', function () {
  var now, id, junk = [];
  
  before(function createTestProjects(done) {
    now = moment().set('milliseconds', 0).toDate();
    id = 1000;
    models.Project.bulkCreate([
      {
        id: 9000,
        name: 'Test project for sessions 1',
        description: 'Description',
        wordcount: 500,
        charcount: 1000,
        targetwc: 1500,
        targetc: 3000,
        active: true,
        finished: false,
        ownerId: 1
      },
      {
        id: 9001,
        name: 'Test project for sessions 2',
        description: 'Description',
        wordcount: 500,
        charcount: 1000,
        targetwc: 1500,
        targetcc: 3000,
        active: true,
        finished: false,
        ownerId: 1
      },
      {
        id: 9002,
        name: 'Test project for sessions 3',
        description: 'Description',
        wordcount: 500,
        charcount: 1000,
        targetwc: 1500,
        targetcc: 3000,
        active: true,
        finished: false,
        ownerId: 1
      }
    ], { individualHooks: true }).then(function () {
      return models.Project.findAll({
        where: {
          name: { like: 'Test project for sessions%' },
          ownerId: 1
        }
      }, { raw: false });
    }).then(function (ps) {
      ps.forEach(function (p) { junk.push(p); });
      done();
    }).catch(done);
  });

  beforeEach(function () {
    id++;
  });

  it('should save correctly a session', function (done) {
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      charcount: 30000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('summary', 'test summary');
        expect(session).to.have.property('start').that.is.equalTime(now);
        expect(session).to.have.property('zoneOffset', -120);
        expect(session).to.have.property('duration', 500);
        expect(session).to.have.property('pausedTime', 2);
        expect(session).to.have.property('wordcount', 5000);
        expect(session).to.have.property('charcount', 30000);
        expect(session).to.have.property('isCountdown', true);
        expect(session).to.have.property('notes', 'test notes');
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should allow null summary', function (done) {
    Session.create({
      id: id,
      summary: null,
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('summary').that.is.null;
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should not allow empty summary', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: '',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'summary');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow summary over 255 characters', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: genString(256),
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'summary');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null start', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'summary',
      start: null,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'start');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should allow null duration', function (done) {
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: null,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('duration').that.is.null;
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should not allow zero duration', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 0,
      pausedTime: 0,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'duration');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow negative duration', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: -1,
      pausedTime: 0,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'duration');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow duration over 23:59', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 86400,
      pausedTime: 0,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'duration');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should allow zero paused time', function (done) {
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('pausedTime', 0);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should not allow null paused time', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: null,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'pausedTime');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow negative paused time', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: -1,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'pausedTime');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow paused time greater than or equal to duration', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 500,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'pausedLessThanDuration');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null wordcount', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: null,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'wordcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow zero wordcount', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: 0,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'wordcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow negative wordcount', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: -1,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'wordcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow wordcount over a billion', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: 1000000001,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'wordcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should not allow null charcount', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: 500,
      charcount: null,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'charcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should allow zero charcount', function (done) {
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      charcount: 0,
      isCountdown: true,
      notes: null,
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('charcount').that.is.equal(0);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });

  it('should not allow negative charcount', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: 500,
      charcount: -1,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'charcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should not allow charcount over two billion', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: 500,
      charcount: 2000000001,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'charcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should allow null notes', function (done) {
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: null,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: null,
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('notes').that.is.null;
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should not allow null project', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: null
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'projectId');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow no project', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes'
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'projectId');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should associate with Project', function (done) {
    var belongsTo = sinon.stub(Session, 'belongsTo'),
      hook = sinon.stub(Session, 'hook');
    
    Session.associate(models);
    
    belongsTo.restore();
    hook.restore();
    
    try {
      expect(belongsTo).to.have.been.calledOnce;
      expect(belongsTo).to.have.been.calledWith(models.Project);
      done();
    } catch (e) {
      done(e);
    }
  });
  
  it('should increment the project wordcount and charcount, and update zoneOffset on creation', function (done) {
    var startingWordcount = 0,
        startingCharcount = 0;
    
    models.Project.findOne(9001).then(function (p) {
      startingWordcount = p.currentWordcount;
      startingCharcount = p.currentCharcount;
      return Session.create({
        id: id,
        summary: 'test summary',
        start: now,
        zoneOffset: id,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        charcount: 10000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      });
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('wordcount', 5000);
        expect(session).to.have.property('charcount', 10000);
      } catch (err) {
        done(err);
      }
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', startingWordcount + 5000);
        expect(project).to.have.property('currentCharcount', startingCharcount + 10000);
        expect(project).to.have.property('zoneOffset', id);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should increment the project wordcount and charcount, and update zoneOffset on bulk creation', function (done) {
    var startingWordcount = 0,
        startingCharcount = 0;
    
    models.Project.findOne(9001).then(function (p) {
      startingWordcount = p.currentWordcount;
      startingCharcount = p.currentCharcount;
      return Session.bulkCreate([{
        id: id,
        summary: 'test summary',
        start: now,
        zoneOffset: id,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        charcount: 10000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      }], { individualHooks: false });
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('wordcount', 5000);
        expect(session).to.have.property('charcount', 10000);
      } catch (err) {
        done(err);
      }
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', startingWordcount + 5000);
        expect(project).to.have.property('currentCharcount', startingCharcount + 10000);
        expect(project).to.have.property('zoneOffset', id);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should increment the project wordcount and charcount, and update zoneOffset on bulk creation with individual hooks', function (done) {
    var startingWordcount = 0,
        startingCharcount = 0;
    
    models.Project.findOne(9001).then(function (p) {
      startingWordcount = p.currentWordcount;
      startingCharcount = p.currentCharcount;
      return Session.bulkCreate([{
        id: id,
        summary: 'test summary',
        start: now,
        zoneOffset: id,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        charcount: 10000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      }], { individualHooks: true });
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('wordcount', 5000);
        expect(session).to.have.property('charcount', 10000);
      } catch (err) {
        done(err);
      }
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', startingWordcount + 5000);
        expect(project).to.have.property('currentCharcount', startingCharcount + 10000);
        expect(project).to.have.property('zoneOffset', id);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should increment/decrement the projects\' wordcount and charcount, and update zoneOffset on update', function (done) {
    var startingWordcount1 = 0,
        startingWordcount2 = 0,
        startingCharcount1 = 0,
        startingCharcount2 = 0;
    
    models.Project.findOne(9001).then(function (p1) {
      startingWordcount1 = p1.currentWordcount;
      startingCharcount1 = p1.currentCharcount;
      return models.Project.findOne(9002);
    }).then(function (p2) {
      startingWordcount2 = p2.currentWordcount;
      startingCharcount2 = p2.currentCharcount;
      return Session.create({
        id: id,
        summary: 'test summary',
        start: now,
        zoneOffset: id,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        charcount: 10000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      });
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      
      session.wordcount = 1000;
      session.charcount = 3000;
      session.projectId = 9002;
      
      return session.save();
    }).then(function () {      
      return models.Project.findOne(9001);
    }).then(function (project1) {
      try {
        expect(project1).to.have.property('currentWordcount', startingWordcount1);
        expect(project1).to.have.property('currentCharcount', startingCharcount1);
        expect(project1).to.have.property('zoneOffset', id);
        return models.Project.findOne(9002);
      } catch (err) {
        return Promise.reject(err);
      }
    }).then(function (project2) {
      try {
        expect(project2).to.have.property('currentWordcount', startingWordcount2 + 1000);
        expect(project2).to.have.property('currentCharcount', startingCharcount2 + 3000);
        expect(project2).to.have.property('zoneOffset', id);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });

  // The update hook isn't quite cool, because it's impossible to get the before data.
  // Maybe go to database triggers
  it('should not allow bulk update', function (done) {
    var session, err;
    Session.create({
      id: id,
      summary: 'Summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      charcount: 10000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
      return Session.update({
        summary: 'Nope'
      }, {
        where: {
          id: id
        }
      });
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.exist;
        expect(err).to.have.property('cause')
        .that.is.an('Object')
        .that.have.property('message')
        .that.contains('not allowed');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should decrement the project wordcount and charcount on destroy', function (done) {
    var startingWordcount = 0,
        startingCharcount = 0;
    
    models.Project.findOne(9001).then(function (p) {
      startingWordcount = p.currentWordcount;
      startingCharcount = p.currentCharcount;
      return Session.create({
        id: id,
        summary: 'test summary',
        start: now,
        zoneOffset: -120,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        charcount: 10000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      });
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      return session.destroy();
    }).then(function () {
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', startingWordcount);
        expect(project).to.have.property('currentCharcount', startingCharcount);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should decrement the project wordcount and charcount on bulk destroy', function (done) {
    var startingWordcount = 0,
        startingCharcount = 0;
    
    models.Project.findOne(9001).then(function (p) {
      startingWordcount = p.currentWordcount;
      startingCharcount = p.currentCharcount;
      return Session.create({
        id: id,
        summary: 'test summary',
        start: now,
        zoneOffset: -120,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        charcount: 10000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      });
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      return Session.destroy({
        where: {
          id: id
        }
      });
    }).then(function () {
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', startingWordcount);
        expect(project).to.have.property('currentCharcount', startingCharcount);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should decrement the project wordcount and charcount on bulk destroy with individual hooks', function (done) {
    var startingWordcount = 0,
        startingCharcount = 0;
    
    models.Project.findOne(9001).then(function (p) {
      startingWordcount = p.currentWordcount;
      startingCharcount = p.currentCharcount;
      return Session.create({
        id: id,
        summary: 'test summary',
        start: now,
        zoneOffset: -120,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        charcount: 10000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      });
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      return Session.destroy({
        where: {
          id: id
        }
      }, { individualHooks: true });
    }).then(function () {
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', startingWordcount);
        expect(project).to.have.property('currentCharcount', startingCharcount);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should not error if a project is not found on bulk create hook', function (done) {
    var session, err;
    var projectFindOne = sinon.stub(models.Project, 'findOne');
    projectFindOne.returns(Promise.resolve(null));
    
    Session.bulkCreate([{
      id: id,
      summary: 'test summary',
      start: new Date(),
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9001
    }]).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      projectFindOne.restore();
      try {
        expect(err).to.not.exist;
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not error if a project is not found on destroy hook', function (done) {
    var err;
    var projectFindOne;
    
    Session.bulkCreate([{
      id: id,
      summary: 'test summary',
      start: new Date(),
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9001
    }]).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      
      projectFindOne = sinon.stub(models.Project, 'findOne');
      projectFindOne.returns(Promise.resolve(null));
      
      return session.destroy();
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      if (projectFindOne) { projectFindOne.restore(); }
      try {
        expect(err).to.not.exist;
        done();
      } catch (e) {
        console.log(err);
        done(e);
      }
    });
  });
  
  it('should bubble up the error if there\'s an error on create hook', function (done) {
    var session, err;
    var projectFindOne = sinon.stub(models.Project, 'findOne');
    projectFindOne.throws();
    
    Session.create({
      id: id,
      summary: 'test summary',
      start: new Date(),
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9001
    }).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      projectFindOne.restore();
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.be.an.instanceof(Error);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should bubble up the error if there\'s an error on bulk create hook', function (done) {
    var session, err;
    var projectFindOne = sinon.stub(models.Project, 'findOne');
    projectFindOne.throws();
    
    Session.bulkCreate([{
      id: id,
      summary: 'test summary',
      start: new Date(),
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9001
    }]).then(function () {
      return Session.findOne(id);
    }).then(function (s) {
      session = s;
      junk.push(session);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      projectFindOne.restore();
      try {
        expect(session).to.not.exist;
        expect(err).to.exist;
        expect(err).to.be.an.instanceof(Error);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should bubble up the error if there\'s an error on update hook', function (done) {
    var err;
    var projectFindOne;
    
    Session.create({
      id: id,
      summary: 'test summary',
      start: new Date(),
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9001
    }).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      
      projectFindOne = sinon.stub(models.Project, 'findOne');
      projectFindOne.throws();
      
      session.wordcount = 4000;
      return session.save();
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      if (projectFindOne) { projectFindOne.restore(); }
      try {
        expect(err).to.exist;
        expect(err).to.be.an.instanceof(Error);
        expect(err).to.not.have.property('errors');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should bubble up the error if there\'s an error on destroy hook', function (done) {
    var err;
    var projectFindOne;
    
    Session.bulkCreate([{
      id: id,
      summary: 'test summary',
      start: new Date(),
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9001
    }]).then(function () {
      return Session.findOne(id);
    }).then(function (session) {
      junk.push(session);
      
      projectFindOne = sinon.stub(models.Project, 'findOne');
      projectFindOne.throws();
      
      return session.destroy();
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      if (projectFindOne) { projectFindOne.restore(); }
      try {
        expect(err).to.exist;
        expect(err).to.be.an.instanceof(Error);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  cleanJunk(junk, after);
});
