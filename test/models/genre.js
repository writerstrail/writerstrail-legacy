var Genre = models.Genre;

describe('Genre model', function () {
  var bigGenreName = genString(255);
  var junk = [];
  
  it('should allow a name with 3 characters', function (done) {
    Genre.create({
      name: '123',
      ownerId: 1
    }).then(function () {
      return Genre.findOne({
        where: {
          name: '123',
          ownerId: 1
        }
      });
    }).then(function (genre) {
      junk.push(genre);
      try {
        expect(genre).to.exist;
        expect(genre).to.have.property('name', '123');
        done();
      } catch (e) {
        done(e);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should allow a name with 255 characters', function (done) {
    Genre.create({
      name: bigGenreName,
      ownerId: 1
    }).then(function () {
      return Genre.findOne({
        where: {
          name: bigGenreName,
          ownerId: 1
        }
      });
    }).then(function (genre) {
      junk.push(genre);
      try {
        expect(genre).to.exist;
        expect(genre).to.have.property('name', bigGenreName);
        done();
      } catch (e) {
        done(e);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should not allow a name with less than 3 characters', function (done) {
    var genre, err;
    Genre.create({
      name: '12',
      ownerId: 1
    }).then(function () {
      return Genre.findOne({
        where: {
          name: '12',
          ownerId: 1
        }
      });
    }).then(function (g) {
      genre = g;
      junk.push(genre);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(genre).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow a name with more than 255 characters', function (done) {
    var genre, err;
    Genre.create({
      name: bigGenreName + 'a',
      ownerId: 1
    }).then(function () {
      return Genre.findOne({
        where: {
          name: bigGenreName + 'a',
          ownerId: 1
        }
      });
    }).then(function (g) {
      genre = g;
      junk.push(genre);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(genre).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null name', function (done) {
    var genre, err;
    Genre.create({
      name: null,
      ownerId: 1
    }).then(function () {
      return Genre.findOne({
        where: {
          name: null,
          ownerId: 1
        }
      });
    }).then(function (g) {
      genre = g;
      junk.push(genre);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(genre).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should save description correctly', function (done) {
    var desc = "this\nis\na\r\ndescription";
    Genre.create({
      name: 'description check test',
      ownerId: 1,
      description: desc
    }).then(function () {
      return Genre.findOne({
        where: {
          name: 'description check test',
          ownerId: 1,
          description: desc
        }
      });
    }).then(function (genre) {
      junk.push(genre);
      try {
        expect(genre).to.exist;
        expect(genre).to.have.property('description', desc);
        done();
      } catch (e) {
        done(e);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should allow null description', function (done) {
    Genre.create({
      name: 'description null test',
      ownerId: 1,
      description: null
    }).then(function () {
      return Genre.findOne({
        where: {
          name: 'description null test',
          ownerId: 1,
          description: null
        }
      });
    }).then(function (genre) {
      junk.push(genre);
      try {
        expect(genre).to.exist;
        expect(genre).to.have.property('description', null);
        done();
      } catch (e) {
        done(e);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should associate with users and projects', function (done) {
    var belongsTo = sinon.stub(Genre, 'belongsTo'),
      belongsToMany = sinon.stub(Genre, 'belongsToMany');
    
    Genre.associate(models);
    
    belongsTo.restore();
    belongsToMany.restore();
    
    try {
      expect(belongsTo).to.have.been.calledOnce;
      expect(belongsTo).to.have.been.calledWith(models.User);
      expect(belongsToMany).to.have.been.calledOnce;
      expect(belongsToMany).to.have.been.calledWith(models.Project);
      done();
    } catch (e) {
      done(e);
    }
  });
  
  it('should not allow null onwer id', function (done) {
    var genre, err;
    Genre.create({
      name: 'valid',
      ownerId: null
    }).then(function () {
      return Genre.findOne({
        where: {
          name: 'valid',
          ownerId: null
        }
      });
    }).then(function (g) {
      genre = g;
      junk.push(genre);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(genre).to.not.exist;
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