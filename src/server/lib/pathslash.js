exports.addPathSlash = function addPathSlash(req, res, next) {
  var pathname = req._parsedUrl.pathname
  var search = req._parsedUrl.search || ''
  if (pathname === '/') return next()
  if (pathname.slice(-1) === '/') return next()
  var last = pathname.split('/').slice(-1)[0]
  var relative = last + '/' + search
  res.redirect(relative)
}
exports.dropPathSlash = function dropPathSlash(req, res, next) {
  var pathname = req._parsedUrl.pathname
  var search = req._parsedUrl.search || ''
  if (pathname === '/') return next()
  if (pathname.slice(-1) !== '/') return next()
  var last = pathname.split('/').slice(-2)[0]
  var relative = '../' + last + search
  res.redirect(relative)
}
