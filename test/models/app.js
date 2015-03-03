 var App = models.App;

describe('App model', function () {
  var id, junk = [];
  
  before(function () {
    id = 1000;
  });

  it('should allow "off" maintenance status', function (done) {
    id += 1;

    App.create({
      id: id,
      maintenance: 'off'
    }).then(function () {
      return App.findOne(id);
    }).then(function (app) {
      junk.push(app);
      try {
        expect(app).to.exist;
        expect(app).to.have.property('maintenance', 'off');
        done();
      } catch (e) {
        done(e);
      }
    }).catch(done);
  });
  
  it('should allow "soft" maintenance status', function (done) {
    id += 1;

    App.create({
      id: id,
      maintenance: 'soft'
    }).then(function () {
      return App.findOne(id);
    }).then(function (app) {
      junk.push(app);
      try {
        expect(app).to.exist;
        expect(app).to.have.property('maintenance', 'soft');
        done();
      } catch (e) {
        done(e);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should allow "hard" maintenance status', function (done) {
    id += 1;

    App.create({
      id: id,
      maintenance: 'hard'
    }).then(function () {
      return App.findOne(id);
    }).then(function (app) {
      junk.push(app);
      try {
        expect(app).to.exist;
        expect(app).to.have.property('maintenance', 'hard');
        done();
      } catch (e) {
        done(e);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should not allow "different" maintenance status', function (done) {
    var err, app;
    id += 1;

    App.create({
      id: id,
      maintenance: 'different'
    }).then(function () {
      return App.findOne(id);
    }).then(function (a) {
      app = a;
      junk.push(app);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(app).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow `null` maintenance status', function (done) {
    var err, app;
    id += 1;

    App.create({
      id: id,
      maintenance: null
    }).then(function () {
      return App.findOne(id);
    }).then(function (a) {
      app = a;
      junk.push(app);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(app).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  cleanJunk(junk, after);
});
