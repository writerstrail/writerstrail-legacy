module.exports = function (req) {
  var navlist = {};
  if (req.user) {
    navlist = {
      'left': [],
      'right': [
        {
          'dropdown': true, 'label': req.user.name, 'list': [
            { 'href': '/projects', 'key': 'projects', 'label': req.__('Projects'), 'title': req.__('Your writing projects') },
            { 'href': '/targets', 'key': 'targets', 'label': req.__('Targets'), 'title': req.__('Your writing targets to achieve') },
            { 'href': '/genres', 'key': 'genres', 'label': req.__('Genres'), 'title': req.__('Your defined genres') },
            { 'key': 'divider' },
            { 'href': '/account', 'key': 'account', 'label': 'Account', 'title': 'Your account settings' },
            { 'href': '/signout', 'key': 'signout', 'label': 'Sign out', 'title': 'Sign out from Writer\'s Trail' }
          ]
        }
      ],
    };
    if (req.user.get('role') === 'superadmin') {
      navlist.right.push({
        'dropdown': true, 'label': 'Admin',
        'list': [
          { 'href': '/admin', 'key': 'admin', 'label': 'Admin', 'title': 'Admin page' },
          { 'href': '/admin/users', 'key': 'adminusers', 'label': 'Users', 'title': 'User administration' }
        ]
      });
    }
  } else {
    navlist = {
      'left': [],
      'right': [
          { 'href': '/signin', 'key': 'signin', 'label': 'Sign in', 'title': 'Sign in to Writer\'s Trail' }
      ],
    };
  }

  return navlist;
};