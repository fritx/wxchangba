//var uuid = require('node-uuid').v4
var bodyParser = require('body-parser')
//var multer = require('multer')
//var bytes = require('bytes')

module.exports = function (app) {
  app.use('/api', bodyParser.urlencoded({ extended: true }))
  //app.use('/api', multer({ limits: bytes('4mb') }))

  require('./route/api-basic')(app)
  require('./route/api-admin')(app)
}

function getNextId(list) {
  var last = list.last()
  return last ? last.id + 1 : 1
}
