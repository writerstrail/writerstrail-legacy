var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	passport = require('passport'),
	flash = require('connect-flash'),
	i18n = require('i18n'),
	csrf = require('csurf');

var app = express();

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	secret: (process.env.WRITERSTRAIL_SESSION_SECRET || 'changemeasimnotsecret'),
	saveUninitialized: true,
	resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(i18n.init);
app.use(csrf());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
var authRoutes = require('./routes/auth.js')(passport);
var navlist = require('./routes/navlist.js');

// Adding navlist
app.locals.navlist = navlist;

// Adding csrf token

app.use(function (req, res, next) {
	res.locals.csrf = req.csrfToken();
	next();
});

app.use('/', routes);
app.use('/', authRoutes);

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
