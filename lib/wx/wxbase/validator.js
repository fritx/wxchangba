var crypto = require('crypto');

var WxValidator = module.exports = function (token, validGet, validPost) {
  this.token = token;
  this.validGet = validGet;
  this.validPost = validPost;
}
WxValidator.prototype.watch = function (app, path) {
  if (this.validGet) {
    app.get(path, this.valid.bind(this));
  }
  if (this.validPost) {
    app.post(path, this.valid.bind(this));
  }
}
WxValidator.prototype.valid = function (req, res, next) {
  if (!this.check(req)) {
    res.send(401);  // 未授权
  } else {
    var echoStr = req.query['echostr'];
    if (echoStr) {
      res.send(echoStr);
    } else {
      next();
    }
  }
}
WxValidator.prototype.check = function (req) {
  var signature = req.query['signature'],
    timestamp = req.query['timestamp'],
    nonce = req.query['nonce'];
  var tmpStr = [this.token, timestamp, nonce].sort().join('');
  tmpStr = sha1(tmpStr);
  return tmpStr === signature;
}

function sha1(str) {
  return crypto.createHash('sha1').update(str).digest('hex');
}

