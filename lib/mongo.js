var mongodb = require('mongodb');

var Mongo = module.exports = function (host, port, dbname) {
  this.db = new mongodb.Db(dbname,
    new mongodb.Server(host, port, {}), {w: 1});
}

Mongo.prototype.open = function (callback, user) {
  this.db.open(function (err, db) {
    if (err) {
      callback(err);
      return;
    }
    if (!user) {
      callback(err, db);
      return;
    }
    db.authenticate(user.username, user.password, function (err1, result) {
      if (!result) {
        db.close();
        callback('Authenticate Failed');
        return;
      }
      callback(err, db);
    });
  });
}
