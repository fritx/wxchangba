var CacheControl = require('express-cache-control')
var _cache = new CacheControl().middleware

// 统一使用分钟为单位
module.exports = function cache(minutes){
  return _cache.call(this, 'minute', minutes)
}
