var _ = require('lodash')

module.exports = function clearsong(sg){
  sg.plays = sg.plays || 0
  _.each(['tags', 'htags'], function(key){
    if (sg[key]) {
      sg[key] = _.compact(sg[key])
      sg[key] = _.uniq(sg[key])
    }
    if (!sg[key] || sg[key].length < 1) delete sg[key]
  })
  _.each(['createtime', 'author', 'localfile',
    'published', 'wxonly', 'wxrecord'], function(k){
    if (!sg[k]) delete sg[k]
  })
}
