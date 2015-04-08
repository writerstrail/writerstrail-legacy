var Project = models.Project;

describe('Project model', function () {
  var junk = [];
  
  it('should create correctly a project', function (done) {
    Project.create({
      name: 'First test',
      description: 'Description',
      wordcount: 500,
      charcount: 4000,
      targetwc: 1500,
      targetcc: 10000,
      active: true,
      finished: false,
      public: true,
      zoneOffset: -180,
      ownerId: 1
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('name', 'First test');
        expect(project).to.have.property('description', 'Description');
        expect(project).to.have.property('wordcount', 500);
        expect(project).to.have.property('charcount', 4000);
        expect(project).to.have.property('targetwc', 1500);
        expect(project).to.have.property('targetcc', 10000);
        expect(project).to.have.property('active', true);
        expect(project).to.have.property('finished', false);
        expect(project).to.have.property('public', true);
        expect(project).to.have.property('zoneOffset', -180);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should associate with users, sessions, targets and genres', function (done) {
    var belongsTo = sinon.stub(Project, 'belongsTo'),
      hasMany = sinon.stub(Project, 'hasMany'),
      belongsToMany = sinon.stub(Project, 'belongsToMany'),
      hook = sinon.stub(Project, 'hook');
    
    
    Project.associate(models);
    
    belongsTo.restore();
    belongsToMany.restore();
    hasMany.restore();
    hook.restore();
    
    try {
      expect(belongsTo).to.have.been.calledOnce;
      expect(belongsTo).to.have.been.calledWith(models.User);
      expect(hasMany).to.have.been.calledOnce;
      expect(hasMany).to.have.been.calledWith(models.Session);
      expect(belongsToMany).to.have.been.calledTwice;
      expect(belongsToMany).to.have.been.calledWith(models.Genre);
      expect(belongsToMany).to.have.been.calledWith(models.Target);   
      done();
    } catch (err) {
      done(err);
    }
  });
  
  it('should set the current wordcount as the starting wordcount upon creation', function (done) {
    Project.create({
      name: 'Test starting -> current wordcount',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('currentWordcount', 500);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should set the current wordcount as the starting wordcount upon bulk creation', function (done) {
    Project.bulkCreate([{
      name: 'Test starting -> current wordcount on bulk create',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }], {
      individualHooks: false
    }).then(function () {
      return Project.findOne({
        where: {
          name: 'Test starting -> current wordcount on bulk create'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('currentWordcount', 500);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
     
  it('should set the current wordcount as the starting wordcount upon bulk creation with individual hooks', function (done) {
    Project.bulkCreate([{
      name: 'Test starting -> current wordcount on bulk create with individual hooks',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }], {
      individualHooks: true
    }).then(function () {
      return Project.findOne({
        where: {
          name: 'Test starting -> current wordcount on bulk create with individual hooks'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('currentWordcount', 500);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should set the current charcount as the starting charcount upon creation', function (done) {
    Project.create({
      name: 'Test starting -> current charcount',
      description: 'Description',
      wordcount: 500,
      charcount: 4000,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('currentCharcount', 4000);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });

  it('should set the current charcount as the starting charcount upon bulk creation', function (done) {
    Project.bulkCreate([{
      name: 'Test starting -> current charcount on bulk create',
      description: 'Description',
      wordcount: 500,
      charcount: 4000,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }], {
      individualHooks: false
    }).then(function () {
      return Project.findOne({
        where: {
          name: 'Test starting -> current charcount on bulk create'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('currentCharcount', 4000);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });

  it('should set the current charcount as the starting charcount upon bulk creation with individual hooks', function (done) {
    Project.bulkCreate([{
      name: 'Test starting -> current charcount on bulk create with individual hooks',
      description: 'Description',
      wordcount: 500,
      charcount: 4000,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }], {
      individualHooks: true
    }).then(function () {
      return Project.findOne({
        where: {
          name: 'Test starting -> current charcount on bulk create with individual hooks'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('currentCharcount', 4000);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });

  it('should not allow no owner', function (done) {
    var project, err;
      
    Project.create({
      name: 'Test no owner',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'ownerId');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null owner', function (done) {
    var project, err;
      
    Project.create({
      name: 'Test null owner',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: null
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'ownerId');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should allow the same name to different users', function (done) {
    Project.create({
      name: 'Test duplicate different user',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('name', 'Test duplicate different user');
      } catch (err) {
        done(err);
      }
      return Project.create({
        name: 'Test duplicate different user',
        description: 'Description',
        wordcount: 500,
        targetwc: 1500,
        active: true,
        finished: false,
        ownerId: 2
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('name', 'Test duplicate different user');
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should not allow the same name to the same user', function (done) {
    var project, err;
    
    Project.create({
      name: 'Test duplicate same user',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('name', 'Test duplicate same user');
      } catch (err) {
        done(err);
      }
      return Project.create({
        name: 'Test duplicate same user',
        description: 'Description',
        wordcount: 500,
        targetwc: 1500,
        active: true,
        finished: false,
        ownerId: 1
      });
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'uniqueName');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should allow the same name to the same user if one is deleted', function (done) {
    Project.create({
      name: 'Test duplicate same user destroyed',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('name', 'Test duplicate same user destroyed');
      } catch (err) {
        done(err);
      }
      return project.destroy();
    }).then(function () {
      return Project.create({
        name: 'Test duplicate same user destroyed',
        description: 'Description',
        wordcount: 500,
        targetwc: 1500,
        active: true,
        finished: false,
        ownerId: 1
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('name', 'Test duplicate same user destroyed');
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should not allow a name with less than 2 characters', function (done) {
    var project, err;
      
    Project.create({
      name: '12',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'name');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow a name with more than 255 characters', function (done) {
    var project, err;
      
    Project.create({
      name: genString(256),
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'name');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should save a null description', function (done) {
    Project.create({
      name: 'Test null description',
      description: null,
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function () {
      return Project.findOne({
        where: {
          ownerId: 1,
          name: 'Test null description'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('description', null);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should not allow a starting wordcount with less than zero', function (done) {
    var project, err;
      
    Project.create({
      name: 'Test less than zero starting',
      description: 'Description',
      wordcount: -1,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'wordcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow a starting wordcount with more than a billion', function (done) {
    var project, err;
      
    Project.create({
      name: 'Test starting over a billion',
      description: 'Description',
      wordcount: 1000000001,
      targetwc: 0,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'wordcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow a starting charcount with less than zero', function (done) {
    var project, err;

    Project.create({
      name: 'Test less than zero starting charcount',
      description: 'Description',
      wordcount: 500,
      charcount: -1,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'charcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should not allow a starting wordcount with more than two billion', function (done) {
    var project, err;

    Project.create({
      name: 'Test starting charcount over two billion',
      description: 'Description',
      wordcount: 0,
      charcount: 2000000001,
      targetwc: 0,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'charcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should not allow a target wordcount with less than zero', function (done) {
    var project, err;
      
    Project.create({
      name: 'Test less than zero target',
      description: 'Description',
      wordcount: 0,
      targetwc: -1,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'targetwc');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow a target wordcount with more than a billion', function (done) {
    var project, err;
      
    Project.create({
      name: 'Test target over a billion',
      description: 'Description',
      wordcount: 500,
      targetwc: 1000000001,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'targetwc');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow a target charcount with less than zero', function (done) {
    var project, err;

    Project.create({
      name: 'Test less than zero target charcount',
      description: 'Description',
      wordcount: 0,
      charcount: 400,
      targetwc: 5000,
      targetcc: -1,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'targetcc');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should not allow a target charcount with more than two billion', function (done) {
    var project, err;

    Project.create({
      name: 'Test target charcount over two billion',
      description: 'Description',
      wordcount: 500,
      targetwc: 0,
      targetcc: 2000000001,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'targetcc');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should allow a start wordcount higher than zero if the target is zero', function (done) {
    Project.create({
      name: 'Test starting with target zero',
      description: 'Description',
      wordcount: 1,
      targetwc: 0,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function () {
      return Project.findOne({
        where: {
          ownerId: 1,
          name: 'Test starting with target zero'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('wordcount', 1);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should not allow a starting wordcount higher than the target wordcount', function (done) {
    var project, err;
      
    Project.create({
      name: 'Test starting over target',
      description: 'Description',
      wordcount: 501,
      targetwc: 500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'targetOverStart');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should allow a starting wordcount equal to the target wordcount', function (done) {
    Project.create({
      name: 'Test starting equal target',
      description: 'Description',
      wordcount: 1000,
      targetwc: 1000,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function () {
      return Project.findOne({
        where: {
          ownerId: 1,
          name: 'Test starting equal target'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('wordcount', 1000);
        expect(project).to.have.property('targetwc', 1000);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should allow a start charcount higher than zero if the target is zero', function (done) {
    Project.create({
      name: 'Test starting charcount with target zero',
      description: 'Description',
      wordcount: 1,
      targetwc: 500,
      charcount: 1,
      targetc: 0,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function () {
      return Project.findOne({
        where: {
          ownerId: 1,
          name: 'Test starting charcount with target zero'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('wordcount', 1);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });

  it('should not allow a starting charcount higher than the target charcount', function (done) {
    var project, err;

    Project.create({
      name: 'Test starting charcount over target',
      description: 'Description',
      wordcount: 1,
      targetwc: 500,
      charcount: 501,
      targetcc: 500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'targetCharOverStart');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should allow a starting charcount equal to the target charcount', function (done) {
    Project.create({
      name: 'Test starting charcount equal target',
      description: 'Description',
      wordcount: 1000,
      targetwc: 1000,
      charcount: 4000,
      targetcc: 4000,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function () {
      return Project.findOne({
        where: {
          ownerId: 1,
          name: 'Test starting charcount equal target'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('charcount', 4000);
        expect(project).to.have.property('targetcc', 4000);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });

  it('should not allow null current wordcount', function (done) {
    var project, err;
      
    Project.create({
      name: 'Test null current wordcount',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1,
      currentWordcount: null
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'currentWordcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow current wordcount lower than zero', function (done) {
    var project, err;
      
    Project.create({
      name: 'Test lower than zero current wordcount',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1,
      currentWordcount: -1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'currentWordcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null current charcount', function (done) {
    var project, err;

    Project.create({
      name: 'Test null current charcount',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1,
      currentCharcount: null
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'currentCharcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should not allow current charcount lower than zero', function (done) {
    var project, err;

    Project.create({
      name: 'Test lower than zero current charcount',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1,
      currentCharcount: -1
    }).then(function (p) {
      project = p;
      junk.push(project);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(project).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'currentCharcount');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should set private as default', function (done) {
    Project.create({
      name: 'Test default access',
      description: 'Just a test',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function () {
      return Project.findOne({
        where: {
          ownerId: 1,
          name: 'Test default access'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('public', false);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });

  it('should set 0 timezone offset as default', function (done) {
    Project.create({
      name: 'Test default tz offset',
      description: 'Just a test',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      "public": false,
      ownerId: 1
    }).then(function () {
      return Project.findOne({
        where: {
          ownerId: 1,
          name: 'Test default tz offset'
        }
      });
    }).then(function (project) {
      junk.push(project);
      try {
        expect(project).to.exist;
        expect(project).to.have.property('zoneOffset', 0);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });

  it('should destroy the sessions associated at soft delete', function (done) {
    var project;
    var now = new Date();
    
    Project.create({
      name: 'Test destroy sessions',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).then(function () {
      return Project.findOne({
        where: {
          name: 'Test destroy sessions',
          ownerId: 1
        }
      });
    }).then(function (p) {
      project = p;
      junk.push(project);
      return models.Session.create({
        projectId: p.id,
        start: now,
        duration: 500,
        pausedTime: 0,
        wordcount: 100,
        isCountdown: false
      });
    }).then(function () {
      return project.destroy();
    }).then(function () {
      return models.Session.findOne({
        where: {
          projectId: project.id,
          start: now,
          duration: 500,
          pausedTime: 0,
          wordcount: 100,
          isCountdown: false
        },
        paranoid: false
      });
    }).then(function (session) {
      try {
        expect(session).to.exist;
        expect(session).to.not.have.property('deletedAt', null);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should raise validation error in case of DB error', function (done) {
    var findOne = sinon.stub(Project, 'findOne').returns(Promise.reject(new Error('oops')));
    
    Project.build({
      name: 'Test validation error on db error',
      description: 'Description',
      wordcount: 500,
      targetwc: 1500,
      active: true,
      finished: false,
      ownerId: 1
    }).validate().then(function (err) {
      try {
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'uniqueName');
        done();
      } catch (e) {
        done(e);
      }
    }).catch(function (err) {
      done(err);
    });
      
    findOne.restore();
  });
  
  cleanJunk(junk, after);
});
