var Target = models.Target;

describe('Target model', function () {
  var junk = [];
  var id, start, end;
  
  before(function (done) {
    id = 1000;
    start = moment().set({
      hour: 15,
      minute: 50,
      second: 20,
      millisecond: 23
    });
    
    end = moment(start).set({
      hour: 10,
      minute: 50,
      second: 20,
      millisecond: 23
    }).add(29, 'days');
    
    done();
  });
  
  it('should correctly create a target', function (done) {
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test ok',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (target) {
      junk.push(target);
      try {
        var validStart = moment(start).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        }).toDate();
        var validEnd = moment(end).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        }).toDate();
        
        expect(target).to.exist;
        expect(target).to.have.property('name', 'Test ok');
        expect(target).to.have.property('start').that.is.equalTime(validStart);
        expect(target).to.have.property('end').that.is.equalTime(validEnd);
        expect(target).to.have.property('zoneOffset', -120);
        expect(target).to.have.property('count', 50000);
        expect(target).to.have.property('unit', 'word');
        expect(target).to.have.property('notes', 'test notes');
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });
  
  it('should not allow no name', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
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
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: null,
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'name');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow name with less than 3 characters', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: '12',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'name');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow name with more than 255 characters', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: genString(256),
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'name');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow zero target', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test zero target',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 0,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'count');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should allow null target', function (done) {
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test null target',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: null,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (target) {
      junk.push(target);
      try {
        expect(target).to.have.property('count', null);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });

  it('should allow word unit', function (done) {
    id += 1;

    Target.create({
      id: id,
      name: 'Test word unit',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (target) {
      junk.push(target);
      try {
        expect(target).to.have.property('unit', 'word');
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });

  it('should allow char unit', function (done) {
    id += 1;

    Target.create({
      id: id,
      name: 'Test char unit',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'char',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (target) {
      junk.push(target);
      try {
        expect(target).to.have.property('unit', 'char');
        done();
      } catch (err) {
        done(err);
      }
    }).catch(done);
  });

  it('should not allow no unit', function (done) {
    var target, err;

    id += 1;

    Target.create({
      id: id,
      name: 'Test no unit',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'unit');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should not allow null unit', function (done) {
    var target, err;

    id += 1;

    Target.create({
      id: id,
      name: 'Test null unit',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: null,
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'unit');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should not allow invalid unit', function (done) {
    var target, err;

    id += 1;

    Target.create({
      id: id,
      name: 'Test invalid unit',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'invalid',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'unit');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow no start', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test no start',
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'start');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow no end', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test no end',
      start: start.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'end');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null start', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test null start',
      start: null,
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'start');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null end', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test null end',
      start: start.toDate(),
      end: null,
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'end');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow start equal end', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test start equal end',
      start: start.toDate(),
      end: start.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'startBeforeEnd');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow start after end', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test start after end',
      start: end.toDate(),
      end: start.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'startBeforeEnd');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow no owner', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test no user',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes'
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'ownerId');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null owner', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test no user',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: null
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('errors').that.have.length.of.at.least(1);
        expect(err).to.have.property('errors').that.contain.an.item.with.property('path', 'ownerId');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow non-existing owner', function (done) {
    var target, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test no user',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 456
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(target).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('name', 'SequelizeForeignKeyConstraintError');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should associate with users and projects', function (done) {
    var belongsTo = sinon.stub(Target, 'belongsTo'),
      belongsToMany = sinon.stub(Target, 'belongsToMany');
    
    Target.associate(models);
    
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
  
  it('should allow same name to same user', function (done) {
    var target1, target2, err;

    id += 1;

    Target.create({
      id: id,
      name: 'Test same name same user',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target1 = t;
      id += 1;
      return Target.create({
        id: id,
        name: 'Test same name same user',
        start: start.toDate(),
        end: end.toDate(),
        zoneOffset: -120,
        count: 50000,
        unit: 'word',
        notes: 'test notes',
        ownerId: 1
      });
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target2 = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(target1).to.exist;
        expect(target1).to.have.property('name', 'Test same name same user');
        expect(target2).to.exist;
        expect(target2).to.have.property('name', 'Test same name same user');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should allow same name to different users', function (done) {
    var target1, target2, err;
    
    id += 1;
    
    Target.create({
      id: id,
      name: 'Test same name other user',
      start: start.toDate(),
      end: end.toDate(),
      zoneOffset: -120,
      count: 50000,
      unit: 'word',
      notes: 'test notes',
      ownerId: 1
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target1 = t;
      id += 1;
      return Target.create({
        id: id,
        name: 'Test same name other user',
        start: start.toDate(),
        end: end.toDate(),
        zoneOffset: -120,
        count: 50000,
        unit: 'word',
        notes: 'test notes',
        ownerId: 2
      });
    }).then(function () {
      return Target.findOne(id);
    }).then(function (t) {
      junk.push(t);
      target2 = t;
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(err).to.not.exist;
        expect(target1).to.exist;
        expect(target1).to.have.property('name', 'Test same name other user');
        expect(target2).to.exist;
        expect(target2).to.have.property('name', 'Test same name other user');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  cleanJunk(junk, after);
});