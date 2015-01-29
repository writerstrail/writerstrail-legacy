module.exports = function (req) {
  var navlist = {
    left: [
      { 'href': '/about', 'key': 'about', 'label': 'About', 'title': 'About Writer\'s Trail' }
    ],
    right: []
  };
  if (req.user) {
    navlist .right.push(
      { 'href': '/dashboard', 'key': 'dashboard', 'label': req.__('Dashboard'), 'title': req.__('The summary page') },
      {
        'dropdown': true, 'label': req.user.name, 'list': [
          { 'href': '/projects/active', 'key': 'projects', 'label': req.__('Projects'), 'title': req.__('Your active writing projects') },
          { 'href': '/sessions', 'key': 'sessions', 'label': req.__('Sessions'), 'title': req.__('Your writing sessions') },
          { 'href': '/targets', 'key': 'targets', 'label': req.__('Targets'), 'title': req.__('Your writing targets to achieve') },
          { 'href': '/genres', 'key': 'genres', 'label': req.__('Genres'), 'title': req.__('Your defined genres') },
          { 'key': 'divider' },
          { 'href': '/settings', 'key': 'settings', 'label': 'Settings', 'title': 'Your personal settings' },
          { 'href': '/account', 'key': 'account', 'label': 'Account', 'title': 'Your account data' },
          { 'href': '/signout', 'key': 'signout', 'label': 'Sign out', 'title': 'Sign out from Writer\'s Trail' }
        ]
      }
    );
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
    navlist.right.push(
        { 'href': '/signin', 'key': 'signin', 'label': 'Sign in', 'title': 'Sign in to Writer\'s Trail' }
    );
  }

  return navlist;
};