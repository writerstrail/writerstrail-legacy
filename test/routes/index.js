describe('Index routes', function () {
  beforeEach(function () {
    this.agent = request(app);
  });

  it('should get the home page', function (done) {
    this.agent
    .get('/')
    .set('Accept', 'text/html')
    .expect('Content-type', /text\/html/)
    .expect(200)
    .end(function (err, res) {
      if (err) { return done(err); }
      try {
        expect(res).to.have.property('text').that.include('Writer\'s Trail');
        expect(res).to.have.property('text').that.include('Apply for closed beta');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should get 404 on non-existing page', function (done) {
    this.agent
    .get('/non-existing')
    .expect(404)
    .end(function (err, res) {
      if (err) { return done(err); }
      try {
        expect(res.text).to.include('Page not found');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
