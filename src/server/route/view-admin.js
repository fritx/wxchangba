var datestr = require('../lib/datestr')
var db = require('../db')
var _ = require('lodash')
var cache = require('../lib/cache')
var config = require('../../../config')
var pathslash = require('../lib/pathslash')
var fillsong = require('../lib/fillsong')
var requser = require('../lib/requser')

module.exports = function(app){
  app.all('/admin/*', requser)

  app.get('/admin/*', function (req, res, next) {
    if (req.url === '/admin/login') return next()
    if (!req.isAdmin()) return res.redirect('login')
    next()
  })

  app.get('/admin/login', cache(config.viewcache))
  app.get('/admin/login', pathslash.dropPathSlash, function (req, res, next) {
    res.__tmpl = 'admin-login'
    res.__data = {
      pagetitle: config.apptitle + '-管理平台'
    }
    next()
  })

  app.get('/admin', pathslash.addPathSlash, function (req, res) {
    res.redirect('songlist')
  })

  // 管理员 歌曲列表
  app.get('/admin/songlist', pathslash.dropPathSlash, function (req, res, next) {
    var currpage = +req.query['page'] || 1
    var pagesize = 10
    var chain = db('songs').chain().filter(function(song){
      //return song.published
      return true
    })
    var numtotal = chain.value().length
    var pagetotal = Math.ceil(numtotal / pagesize)
    currpage = between(currpage, 1, pagetotal)
    // fixme: over redirect ?page

    var _songs = chain.reverse().value()
    var indexstart = (currpage-1)*pagesize
    _songs = _songs.slice(indexstart, indexstart+pagesize)

    // 避免意外修改db 深克隆
    var songs = _.cloneDeep(_songs)
    _.each(songs, fillsong)
    res.__tmpl = 'admin-songlist'
    res.__data = {
      pagetitle: config.apptitle + '-管理平台',
      listtitle: '歌曲管理',
      numtotal: numtotal,
      pagetotal: pagetotal,
      currpage: currpage,
      songs: songs
    }
    next()
  })

  // 管理员 查阅歌曲
  app.get('/admin/song/view/:id', function (req, res) {
    var msgId = parseInt(req.params['id']);
    songColl.findOne({
      //published: true,
      msgid: msgId
    }, {
      // 提取相应的列
      fields: ['msgid', 'name', 'playlength', 'plays', 'createtime', 'published']
    }, function (err, song) {
      if (!song) return res.send({ msg: '歌曲不存在' });
      res.send({ song: song });
    });
  });
}

function between(v, a, b){
  v = Math.max(v, a)
  v = Math.min(v, b)
  return v
}
function prefixurl(s){
  return config.urlprefix + s
}
