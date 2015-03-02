var Session = models.Session;

describe('Session model', function () {
  var junk = [];
  
  before(function createTestProjects(done) {
    models.Project.bulkCreate([
      {
        id: 9000,
        name: 'Test project for sessions 1',
        description: 'Description',
        wordcount: 500,
        targetwc: 1500,
        active: true,
        finished: false,
        ownerId: 1
      },
      {
        id: 9001,
        name: 'Test project for sessions 2',
        description: 'Description',
        wordcount: 500,
        targetwc: 1500,
        active: true,
        finished: false,
        ownerId: 1
      },
      {
        id: 9002,
        name: 'Test project for sessions 3',
        description: 'Description',
        wordcount: 500,
        targetwc: 1500,
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
  
  it('should save correctly a session', function (done) {
    var now = new Date();
    Session.create({
      id: 1000,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(1000);
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
        expect(session).to.have.property('isCountdown', true);
        expect(session).to.have.property('notes', 'test notes');
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should allow null summary', function (done) {
    var now = new Date();
    Session.create({
      id: 1001,
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
      return Session.findOne(1001);
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
    var now = new Date();
    Session.create({
      id: 1005,
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
      return Session.findOne(1005);
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
        expect(err).to.have.deep.property('errors[0].path', 'summary');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow summary over 255 characters', function (done) {
    var session, err;
    var now = new Date();
    Session.create({
      id: 1006,
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
      return Session.findOne(1006);
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
        expect(err).to.have.deep.property('errors[0].path', 'summary');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null start', function (done) {
    var session, err;
    Session.create({
      id: 1007,
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
      return Session.findOne(1007);
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
        expect(err).to.have.deep.property('errors[0].path', 'start');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should allow null duration', function (done) {
    var now = new Date();
    Session.create({
      id: 1002,
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
      return Session.findOne(1002);
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
    var now = new Date();
    Session.create({
      id: 1008,
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
      return Session.findOne(1008);
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
    var now = new Date();
    Session.create({
      id: 1008,
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
      return Session.findOne(1008);
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
    var now = new Date();
    Session.create({
      id: 1009,
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
      return Session.findOne(1009);
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
    var now = new Date();
    Session.create({
      id: 1003,
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
      return Session.findOne(1003);
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
    var now = new Date();
    Session.create({
      id: 1010,
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
      return Session.findOne(1010);
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
    var now = new Date();
    Session.create({
      id: 1011,
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
      return Session.findOne(1011);
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
    var now = new Date();
    Session.create({
      id: 1012,
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
      return Session.findOne(1012);
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
    var now = new Date();
    Session.create({
      id: 1013,
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
      return Session.findOne(1013);
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
    var now = new Date();
    Session.create({
      id: 1014,
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
      return Session.findOne(1014);
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
    var now = new Date();
    Session.create({
      id: 1015,
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
      return Session.findOne(1015);
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
    var now = new Date();
    Session.create({
      id: 1016,
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
      return Session.findOne(1016);
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
  
  it('should allow null notes', function (done) {
    var now = new Date();
    Session.create({
      id: 1004,
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
      return Session.findOne(1004);
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
    var now = new Date();
    Session.create({
      id: 1017,
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
      return Session.findOne(1017);
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
    var now = new Date();
    Session.create({
      id: 1018,
      summary: 'test summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 0,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes'
    }).then(function () {
      return Session.findOne(1018);
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
  
  it('should increment the project wordcount on creation', function (done) {
    var now = new Date();
    var starting = 0;
    
    models.Project.findOne(9001).then(function (p) {
      starting = p.currentWordcount;
      return Session.create({
        id: 1019,
        summary: 'test summary',
        start: now,
        zoneOffset: -120,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      });
    }).then(function () {
      return Session.findOne(1019);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('wordcount', 5000);
      } catch (err) {
        done(err);
      }
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', starting + 5000);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should increment the project wordcount on bulk creation', function (done) {
    var now = new Date();
    var starting = 0;
    
    models.Project.findOne(9001).then(function (p) {
      starting = p.currentWordcount;
      return Session.bulkCreate([{
        id: 1020,
        summary: 'test summary',
        start: now,
        zoneOffset: -120,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      }], { individualHooks: false });
    }).then(function () {
      return Session.findOne(1020);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('wordcount', 5000);
      } catch (err) {
        done(err);
      }
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', starting + 5000);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should increment the project wordcount on bulk creation with individual hooks', function (done) {
    var now = new Date();
    var starting = 0;
    
    models.Project.findOne(9001).then(function (p) {
      starting = p.currentWordcount;
      return Session.bulkCreate([{
        id: 1021,
        summary: 'test summary',
        start: now,
        zoneOffset: -120,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      }], { individualHooks: true });
    }).then(function () {
      return Session.findOne(1021);
    }).then(function (session) {
      junk.push(session);
      try {
        expect(session).to.exist;
        expect(session).to.have.property('wordcount', 5000);
      } catch (err) {
        done(err);
      }
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', starting + 5000);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should increment/decrement the projects\' wordcount on update', function (done) {
    var now = new Date();
    var starting1 = 0, starting2 = 0;
    
    models.Project.findOne(9001).then(function (p1) {
      starting1 = p1.currentWordcount;
      return models.Project.findOne(9002);
    }).then(function (p2) {
      starting2 = p2.currentWordcount;
      return Session.create({
        id: 1022,
        summary: 'test summary',
        start: now,
        zoneOffset: -120,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      });
    }).then(function () {
      return Session.findOne(1022);
    }).then(function (session) {
      junk.push(session);
      
      session.wordcount = 1000;
      session.projectId = 9002;
      
      return session.save();
    }).then(function () {      
      return models.Project.findOne(9001);
    }).then(function (project1) {
      try {
        expect(project1).to.have.property('currentWordcount', starting1);
        return models.Project.findOne(9002);
      } catch (err) {
        done(err);
      }
    }).then(function (project2) {
      try {
        expect(project2).to.have.property('currentWordcount', starting2 + 1000);
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
    var now = new Date();
    Session.create({
      id: 1023,
      summary: 'Summary',
      start: now,
      zoneOffset: -120,
      duration: 500,
      pausedTime: 2,
      wordcount: 5000,
      isCountdown: true,
      notes: 'test notes',
      projectId: 9000
    }).then(function () {
      return Session.findOne(1023);
    }).then(function (s) {
      session = s;
      junk.push(session);
      return Session.update({
        summary: 'Nope'
      }, {
        where: {
          id: 1023
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
  
  it('should decrement the project wordcount on destroy', function (done) {
    var now = new Date();
    var starting = 0;
    
    models.Project.findOne(9001).then(function (p) {
      starting = p.currentWordcount;
      return Session.create({
        id: 1024,
        summary: 'test summary',
        start: now,
        zoneOffset: -120,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      });
    }).then(function () {
      return Session.findOne(1024);
    }).then(function (session) {
      junk.push(session);
      return session.destroy();
    }).then(function () {
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', starting);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should decrement the project wordcount on bulk destroy', function (done) {
    var now = new Date();
    var starting = 0;
    
    models.Project.findOne(9001).then(function (p) {
      starting = p.currentWordcount;
      return Session.create({
        id: 1025,
        summary: 'test summary',
        start: now,
        zoneOffset: -120,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      });
    }).then(function () {
      return Session.findOne(1025);
    }).then(function (session) {
      junk.push(session);
      return Session.destroy({
        where: {
          id: 1025
        }
      });
    }).then(function () {
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', starting);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should decrement the project wordcount on bulk destroy with individual hooks', function (done) {
    var now = new Date();
    var starting = 0;
    
    models.Project.findOne(9001).then(function (p) {
      starting = p.currentWordcount;
      return Session.create({
        id: 1026,
        summary: 'test summary',
        start: now,
        zoneOffset: -120,
        duration: 500,
        pausedTime: 2,
        wordcount: 5000,
        isCountdown: true,
        notes: 'test notes',
        projectId: 9001
      });
    }).then(function () {
      return Session.findOne(1026);
    }).then(function (session) {
      junk.push(session);
      return Session.destroy({
        where: {
          id: 1026
        }
      }, { individualHooks: true });
    }).then(function () {
      return models.Project.findOne(9001);
    }).then(function (project) {
      try {
        expect(project).to.have.property('currentWordcount', starting);
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
      id: 1031,
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
      return Session.findOne(1031);
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
      id: 1032,
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
      return Session.findOne(1032);
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
      id: 1029,
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
      return Session.findOne(1029);
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
      id: 1027,
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
      return Session.findOne(1027);
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
      id: 1030,
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
      return Session.findOne(1030);
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
      id: 1028,
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
      return Session.findOne(1028);
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