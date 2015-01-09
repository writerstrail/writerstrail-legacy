var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	MysqlStore = require('express-mysql-session'),
	passport = require('passport'),
	flash = require('connect-flash'),
	i18n = require('i18n'),
	csrf = require('csurf'),
	moment = require('moment'),
	_ = require('lodash');

var app = express();

var env = process.env.NODE_ENV || "development";
var config = require('./config/config.js')[env];

// create session store
var sessionStore = new MysqlStore({
	host: config.host,
	port: config.port || 3306,
	user: config.username,
	password: config.password,
	database: config.database
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// i18n configuration
i18n.configure({
	locales: ['en', 'pt'],
	directory: path.join(__dirname, 'locales')
});

// passport configuration
require('./config/passport')(passport);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
	secret: (process.env.WRITERSTRAIL_SESSION_SECRET || 'changemeasimnotsecret'),
	store: sessionStore,
	saveUninitialized: true,
	resave: true
}));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(i18n.init);
app.use(csrf());

var routes = require('./routes/index');
var authRoutes = require('./routes/auth.js')(passport);
var adminRoutes = require('./routes/admin.js');
var navlist = require('./routes/navlist.js');

// Adding locals
app.use(function (req, res, next) {
	res.locals.csrf = req.csrfToken();
	if (req.isAuthenticated()) {
		res.locals.user = req.user;
	}
	res.locals.navlist = navlist(req);
	
	res.locals._ = _;
	res.locals.moment = moment;
	next();
});

app.use('/', routes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
