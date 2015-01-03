
module.exports = function (req) {
	var navlist = {
		'logged': {
			'left': [],
			'right': [
				{ 'href': '/account', 'key': 'account', 'label': 'Account', 'title': 'Your account settings' },
				{ 'href': '/signout', 'key': 'signout', 'label': 'Sign out', 'title': 'Sign out from Writer\'s Trail' }
			],
		},
		'unlogged': {
			'left': [],
			'right': [
				{ 'href': '/signin', 'key': 'signin', 'label': 'Sign in', 'title': 'Sign in to Writer\'s Trail' }
			],
		}
	};

	return navlist;
};