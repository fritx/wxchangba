module.exports = function (mode) {
  try {
    var config = require('./common');
    require('./modes/' + mode)(config);
    return config;
  } catch (err) {
    console.error(err);
    throw new Error('Config Error');
  }
}
