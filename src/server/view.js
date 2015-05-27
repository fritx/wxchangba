var path = require('path')
//var jade = require('jade')
//var exphbs = require('express-handlebars')
var _ = require('lodash')
var config = require('../../config')
//var hbs = exphbs.create()
//var Handlebars = hbs.handlebars

module.exports = function (app) {
  //app.engine('jade', jade.__express)
  //app.engine('hbs', hbs.engine)
  _.extend(_.templateSettings, {
    escape: /{{([^{][\s\S]*?)}}/g, // 适应interpolate修改
    interpolate: /{{{([\s\S]+?)}}}/g
  })
  app.engine('html', viewEngine)
  app.set('view engine', 'html')
  app.set('views', path.resolve(__dirname, '../web'))
  
  require('./route/view-basic')(app)
  require('./route/view-admin')(app)

  app.get('*', function(req, res, next) {
    if (!res.__tmpl) return next()
    var data = _.extend(_.pick(config, [
      'appkeyw', 'appdesc',
      'apptitle', 'appyear', 'appversion',
      'urlprefix', 'statshtml'
    ]), res.__data)
    res.render(res.__tmpl, data)
  })
}

// fixme: 通用cache
// fixme: 并发cache
var fscache = require('./lib/fscache')
function viewEngine(viewpath, data, callback){
  fscache.get(viewpath, function(err, buf){
    if (err) return callback(err)
    var output = ''
    try {
      var str = buf.toString()
      var tmplfn = _.template(str)
      output = tmplfn(data)
    } catch(err1) {
      //console.error(err1)
      return callback(err1)
    }
    callback(null, output)
  })
}
