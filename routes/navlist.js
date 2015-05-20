module.exports = function (req) {
  var navlist = {
    left: [
      { 'href': '/features', 'key': 'features', 'label': 'Features', 'title': 'Main features of Writer\'s Trail' }
    ],
    right: [
      { 'href': '/feedback', 'key': 'feedback', 'label': 'Feedback', 'title': 'Send feedback about Writer\'s Trail', icon: 'comments-o' }
    ]
  };
  if (req.user) {
    navlist .right.push(
      { 'href': '/dashboard', 'key': 'dashboard', 'label': req.__('Dashboard'), 'title': req.__('The summary page'), icon: 'dashboard' },
      { 'href': '/timer', 'key': 'timer', 'label': 'Timer', 'title': 'Track your writing sessions', icon: 'coffee' },
      {
        'dropdown': true, 'label': req.user.name, key: 'user', icon: 'user',  'list': [
          { 'href': '/stats', 'key': 'stats', 'label': 'Statistics', 'title': 'Some information about your writing habits', icon: 'calculator' },
          { 'key': 'divider' },
          { 'href': '/projects/active', 'key': 'projects', 'label': req.__('Projects'), 'title': req.__('Your active writing projects'), icon: 'fire' },
          { 'href': '/sessions', 'key': 'sessions', 'label': req.__('Sessions'), 'title': req.__('Your writing sessions'), icon: 'calendar' },
          { 'href': '/targets?current=true', 'key': 'targets', 'label': req.__('Targets'), 'title': req.__('Your current writing targets to achieve'), icon: 'bullseye' },
          { 'href': '/genres', 'key': 'genres', 'label': req.__('Genres'), 'title': req.__('Your defined genres'), icon: 'tags' },
          { 'key': 'divider' },
          { 'href': '/settings', 'key': 'settings', 'label': 'Settings', 'title': 'Your personal settings', icon: 'gears' },
          { 'href': '/account', 'key': 'account', 'label': 'Account', 'title': 'Your account data', icon: 'user' },
          { 'href': '/signout', 'key': 'signout', 'label': 'Sign out', 'title': 'Sign out from Writer\'s Trail', icon: 'sign-out' },
          { 'key': 'divider' },
          { 'href': '/help', 'key': 'help', 'label': 'Help', 'title': "Help about Writer's Trail" , icon: "question-circle"}
        ]
      }
    );
    if (req.user.get('role') === 'superadmin') {
      navlist.right.push({
        'dropdown': true, 'label': 'Admin',
        'list': [
          { 'href': '/admin', 'key': 'admin', 'label': 'Admin', 'title': 'Admin page' },
          { 'href': '/admin/users', 'key': 'adminusers', 'label': 'Users', 'title': 'User administration' },
          { 'href': '/admin/periods', 'key': 'adminperiods', 'label': 'Periods', 'title': 'Periods administration' },
          { 'key': 'divider' },
          { 'href': '/admin/feedback', 'key': 'adminfeedback', 'label': 'Feedback', 'title': 'Feedback administration' },
          { 'key': 'divider' },
          { 'href': '/admin/mail', 'key': 'adminmail', 'label': 'Mail', 'title': 'Send email to users' }
        ]
      });
    }
  } else {
    navlist.right.push(
      { 'href': '/signin', 'key': 'signin', 'label': 'Sign in', 'title': 'Sign in to Writer\'s Trail', icon: 'sign-in' }
    );
  }

  return navlist;
};
