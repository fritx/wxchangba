var _ = require('underscore');

module.exports = function (config) {
  _.extend(config, {
    env: 'production',
    port: process.env.APP_PORT,
    mongo: {
      host: process.env.BAE_ENV_ADDR_MONGO_IP,
      port: process.env.BAE_ENV_ADDR_MONGO_PORT * 1,  // to number
      dbname: 'dIoGBYlNCiMCgixCaZcS',
      user: {
        username: process.env.BAE_ENV_AK,
        password: process.env.BAE_ENV_SK
      }
    }
  });
  _.extend(config.wx, {
    validGet: true,
    validPost: false,
    loginAccount: true
  });
  return config;
}
