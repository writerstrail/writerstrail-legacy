// Default values for anonymous user

var defaultSettings = require('./defaultsettings');

module.exports = {
  id: -1,
  name: 'Anonymous',
  settings: defaultSettings,
  activated: false,
  verified: false
};
