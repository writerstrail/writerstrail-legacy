#!/bin/env node
var debug = require('debug')('ExpressApp2');
var app = require('./app');
var models = require('./models');

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('address', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

var server = app.listen(app.get('port'), app.get('address'), function () {
	console.log('Express server listening on port ' + server.address().port);
});