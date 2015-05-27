var _ = require('lodash')
var config = require('../../../config')

module.exports = function (req, res, next) {
  req.clearUser = function () {
    delete req.session['user'];
  }
  req.setUser = function (user) {
    req.session['user'] = user;
  }
  req.getUser = function (user) {
    return req.session['user'];
  }
  req.isAdmin = function (user) {
    user = user || req.getUser();
    return user && _.findWhere(config.admin, user);
  }
  next();
}
