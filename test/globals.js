global.chai = require('chai');
global.sinon = require('sinon');
global.expect = global.chai.expect;
global.genString = require('../utils/functions/test/gen-string');
global.cleanJunk = require('../utils/functions/test/clean-junk');
global.models = require('../models');
global._ = require('lodash');
global.moment = require('moment');
global.app = require('../app');
global.request = require('supertest');
global.agent = global.request(global.app);

if (typeof Promise === 'undefined') {
  global.Promise = require('bluebird');
}

global.chai.use(require('sinon-chai'));
global.chai.use(require('chai-datetime'));
global.chai.use(require('chai-things'));
