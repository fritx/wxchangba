var _ = require('underscore');

module.exports = function (config) {
  _.extend(config, {
    env: 'production',
    port: 3099,
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
