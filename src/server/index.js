var argv = require('optimist').argv
var config = require('../../config')
var port = argv.p || config.port

var app = require('./app')
if (module.parent) {
  return module.exports = app
}

var server = module.exports = app.listen(port, function (e) {
  if (e) throw e
  console.log('server started at %d', port)
})
