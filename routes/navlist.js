module.exports = function (req) {
	var navlist = {};
	if (req.user) {
		navlist = {
			'left': [],
			'right': [
				{
					'dropdown': true, 'label': req.user.name, 'list': [
						{ 'href': '/account', 'key': 'account', 'label': 'Account', 'title': 'Your account settings' },
						{ 'key': 'divider' },
						{ 'href': '/signout', 'key': 'signout', 'label': 'Sign out', 'title': 'Sign out from Writer\'s Trail' }
					]
				}
			],
		}
	} else {
		navlist = {
			'left': [],
			'right': [
				{ 'href': '/signin', 'key': 'signin', 'label': 'Sign in', 'title': 'Sign in to Writer\'s Trail' }
			],
		}
	}	;
	
	return navlist;
};