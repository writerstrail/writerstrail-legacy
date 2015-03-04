describe('Index routes', function () {
  it('should get the home page', function (done) {
    agent
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
});
