module.exports = function (mode) {
  try {
    var config = require('./modes/' + mode);
    return config;
  } catch (err) {
    console.error(err);
    throw new Error('Config Error');
  }
}
