var path = require('path')
//var jade = require('jade')
//var exphbs = require('express-handlebars')
var _ = require('lodash')
var config = require('../../config')
//var hbs = exphbs.create()
//var Handlebars = hbs.handlebars
var fs = require('fs')
var minify = require('html-minifier').minify
var statshtml = fs.readFileSync(config.statsfile).toString()

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
      'urlprefix'
    ]), {
      statshtml: statshtml
    }, res.__data)
    res.render(res.__tmpl, data)
  })
}

// fixme: 通用cache
// fixme: 并发cache
var fscache = require('./lib/fscache')
var minopts = {
  minifyCSS: true,
  minifyJS: true,
  collapseWhitespace: true, // 小心inline-block边距坑
  removeComments: true
}
function viewEngine(viewpath, data, callback){
  fscache.get(viewpath, function(err, buf){
    if (err) return callback(err)
    try {
      var str = buf.toString()
      var tmplfn = _.template(str)
      var output = tmplfn(data)
      // fixme: 需要转移到预编译
      //output = minify(output, minopts)
    } catch(err1) {
      //console.error(err1)
      return callback(err1)
    }
    callback(null, output)
  })
}
