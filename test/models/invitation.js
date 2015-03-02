var Invitation = models.Invitation;

describe('Invitation model', function () {
  var junk = [];
  
  it('should save correctly an invitation', function (done) {
    Invitation.create({
      code: 'test1',
      amount: 5
    }).then(function (invitation) {
      junk.push(invitation);
      try {
        expect(invitation).to.exist;
        expect(invitation).to.have.property('code', 'test1');
        expect(invitation).to.have.property('amount', 5);
        done();
      } catch (e) {
        done(e);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should not allow code greater than 255 characters', function (done) {
    var bigCode = genString(256);
    
    var invitation, err;
      
    Invitation.create({
      code: bigCode,
      amount: 5
    }).then(function (i) {
      invitation = i;
      junk.push(invitation);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(invitation).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        done();
      } catch (err) {
        done(err);
      }
    });
  });
  
  it('should not allow amount less than one', function (done) {    
    var invitation, err;
      
    Invitation.create({
      code: 'test<1',
      amount: 0
    }).then(function (i) {
      invitation = i;
      junk.push(invitation);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(invitation).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null code', function (done) {
    var invitation, err;
      
    Invitation.create({
      code: null,
      amount: 5
    }).then(function (i) {
      invitation = i;
      junk.push(invitation);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(invitation).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  
  it('should not allow null amount', function (done) {
    var invitation, err;
      
    Invitation.create({
      code: 'testNullAmount',
      amount: null
    }).then(function (i) {
      invitation = i;
      junk.push(invitation);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(invitation).to.not.exist;
        expect(err).to.exist;
        expect(err).to.have.property('message', 'Validation error');
        done();
      } catch (err) {
        done(err);
      }
    });
  });
  
  it('should consider no amount as 1', function (done) {
    Invitation.create({
      code: 'testNoAmount'
    }).then(function (invitation) {
      junk.push(invitation);
      try {
        expect(invitation).to.exist;
        expect(invitation).to.have.property('code', 'testNoAmount');
        expect(invitation).to.have.property('amount', 1);
        done();
      } catch (err) {
        done(err);
      }
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should not allow duplicate codes', function (done) {
    var invitation, err;
    
    Invitation.create({
      code: 'testDuplicateCode',
      amount: 5
    }).then(function (i) {
      junk.push(i);
      try {
        expect(i).to.exist;
        expect(i).to.have.property('code', 'testDuplicateCode');
      } catch (e) {
        done(e);
      }
      return Invitation.create({
        code: 'testDuplicateCode',
        amount: 6
      });
    }).then(function (i) {
      invitation = i;
      junk.push(invitation);
    }).catch(function (e) {
      err = e;
    }).finally(function () {
      try {
        expect(invitation).to.not.exist;
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