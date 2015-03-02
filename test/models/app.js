 var App = models.App;

describe('App model', function () {
  var junk = [];
  
  it('should allow "off" maintenance status', function (done) {
    App.create({
      id: 1000,
      maintenance: 'off'
    }).then(function () {
      return App.findOne(1000);
    }).then(function (app) {
      junk.push(app);
      expect(app).to.exist;
      expect(app).to.have.property('maintenance', 'off');
      done();
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should allow "soft" maintenance status', function (done) {
    App.create({
      id: 1001,
      maintenance: 'soft'
    }).then(function () {
      return App.findOne(1001);
    }).then(function (app) {
      junk.push(app);
      expect(app).to.exist;
      expect(app).to.have.property('maintenance', 'soft');
      done();
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should allow "hard" maintenance status', function (done) {
    App.create({
      id: 1002,
      maintenance: 'hard'
    }).then(function () {
      return App.findOne(1002);
    }).then(function (app) {
      junk.push(app);
      expect(app).to.exist;
      expect(app).to.have.property('maintenance', 'hard');
      done();
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should not allow "different" maintenance status', function (done) {
    var err, app;
    App.create({
      id: 1003,
      maintenance: 'different'
    }).then(function () {
      return App.findOne(1003);
    }).then(function (a) {
      app = a;
      junk.push(app);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      expect(app).to.not.exist;
      expect(err).to.exist;
      expect(err).to.have.property('message', 'Validation error');
      done();
    });
  });
  
  it('should not allow `null` maintenance status', function (done) {
    var err, app;
    App.create({
      id: 1004,
      maintenance: null
    }).then(function () {
      return App.findOne(1004);
    }).then(function (a) {
      app = a;
      junk.push(app);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      expect(app).to.not.exist;
      expect(err).to.exist;
      expect(err).to.have.property('message', 'Validation error');
      done();
    });
  });
  
  cleanJunk(junk, after);
});