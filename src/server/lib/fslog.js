var util = require('util')
var fs = require('fs-extra')
var datestr = require('./datestr')
var file = './log.txt'
fs.ensureFileSync(file)

module.exports = function fslog(o){
  var log = util.inspect(o)
  fs.appendFile(file, [
    '\n\n\n', datestr.tostr(Date.now()), '\n\n', log
  ].join(''), function(e){
    if (e) throw e
  })
}