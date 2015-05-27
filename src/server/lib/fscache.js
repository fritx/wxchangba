var fs = require('fs')
var path = require('path')
var config = require('../../../config')
var maxage = config.viewcache*6e4 //ms
var store = {}

exports.get = function fsget(filepath, cb){
  filepath = path.resolve(filepath)
  var item = store[filepath]
  var now = Date.now()
  if (item && now < item.expires) {
    return cb(null, item.value)
  }
  fs.readFile(filepath, function(err, buf){
    if (err) return cb(err)
    item = store[filepath] = {
      expires: now + maxage,
      value: buf
    }
    cb(null, item.value)
  })
}
