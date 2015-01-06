var express = require('express');
var router = express.Router();

function isAdmin(req, res, next) {
	if (req.user && req.user.role === 'superadmin') {
		next();
	} else {
		var err = new Error();
		err.message = 'Not found';
		err.status = 404;
		err.stack = Error.captureStackTrace(this, arguments.calee);
		next(err);
	}
}

router.use('*', isAdmin);

router.get('/', function (req, res) {
	res.render('admin/index', {
		title: 'Administration',
		section: 'admin'
	});
});

module.exports = router;