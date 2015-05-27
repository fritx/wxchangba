module.exports = function fullUrl(req) {
  return req.protocol + '://' +
    req.get('host') +
    config.urlprefix +
    req.originalUrl
}
