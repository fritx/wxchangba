var _ = require('underscore');

module.exports = function (config) {
  _.extend(config, {
    env: 'production',
    port: process.env.PORT || 80,
    mongo: {
      host: 'localhost',
      port: 27017,
      dbname: 'etips-www'
    }
  });
  _.extend(config.wx, {
    validGet: false,
    validPost: false,
    loginAccount: true
  });
  return config;
}
