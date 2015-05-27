var datestr = require('../lib/datestr')
var db = require('../db')
var _ = require('lodash')
var cache = require('../lib/cache')
var config = require('../../../config')
var pathslash = require('../lib/pathslash')
var fillsong = require('../lib/fillsong')

module.exports = function(app){
  app.get('/', cache(config.viewcache))
  app.get('/', pathslash.addPathSlash, function (req, res) {
    //res.redirect(prefixurl('/channels'))
    res.redirect('songlist')
  })
  //app.get('/channels', function (req, res) {
  //  res.send('Top Channels')
  //})

  app.get('/songlist', cache(config.viewcache))
  app.get('/songlist', pathslash.dropPathSlash, function (req, res, next) {
    var listenum = {
      'latest': '最新列表',
      'hottest': '最火列表'
    }
    var defaultlist = _.keys(listenum)[0]
    var listtype = req.query['list'] || defaultlist
    var listtitle = listenum[listtype]
    if (!listtitle) {
      // fixme: over redirect ?list
      return res.redirect('songlist')
    }
    var chain = db('songs').chain().filter(function(song){
      return song.published
    })
    var _songs
    if (listtype === defaultlist) {
      _songs = chain.reverse().value()
    } else {
      _songs = chain.sortBy({
        'hottest': function(song){
          return -song.plays
        }
      }[listtype]).value()
    }

    var pagesize = 10
    var numtotal = chain.value().length
    var pagetotal = Math.ceil(numtotal / pagesize)
    var currpage = +req.query['page'] || 1
    currpage = between(currpage, 1, pagetotal)
    // fixme: over redirect ?page
    var indexstart = (currpage-1)*pagesize
    _songs = _songs.slice(indexstart, indexstart+pagesize)
    
    var _plists = db('playlists').filter({
      published: true
    })

    // 避免意外修改db 深克隆
    var plists = _.cloneDeep(_plists)
    var songs = _.cloneDeep(_songs)
    _.each(songs, fillsong)
    res.__tmpl = 'songlist'
    res.__data = {
      rndcode: Math.random(), // 强制禁缓存
      pagetitle: config.apptitle + '-' + listtitle,
      listtype: listtype,
      listtitle: listtitle,
      numtotal: numtotal,
      pagetotal: pagetotal,
      currpage: currpage,
      plists: plists,
      songs: songs
    }
    next()
  })

  app.get('/playlist/:plistid', cache(config.viewcache))
  app.get('/playlist/:plistid', pathslash.dropPathSlash, function (req, res, next) {
    var plistid = req.params['plistid']
    var _plist = db('playlists').find({
      published: true,
      plistid: plistid
    })
    if (!_plist) {
      return res.redirect('../songlist?plistnotfound=1')
    }
    var _songs = db('songs').filter(function(sg){
      return sg.published
    })
    _songs = _.map(_plist.songids, function(id){
      return _.find(_songs, {
        mediaid: id
      })
    })
    _songs = _.compact(_songs)
    if (_songs.length < 1) {
      return res.redirect('../songlist?emptyplist=1')
    }
    _.each(_songs, function(sg){
      sg.plays += 1
    })
    db.save()

    // 避免意外修改db 深克隆
    var plist = _.cloneDeep(_plist)
    var songs = _.cloneDeep(_songs)
    _.each(songs, fillsong)
    var listarr = _.pluck(songs, 'filepath')
    res.__tmpl = 'playlist'
    res.__data = {
      rndcode: Math.random(), // 强制禁缓存
      pagetitle: plist.title,
      plist: plist,
      listarr: JSON.stringify(listarr),
      songs: songs
    }
    next()
  })

  // 需放在 /song/:id 之前
  //app.get('/song/random', cache(0)) // 强制禁缓存
  // 依靠url随机参数 打破缓存
  app.get('/song/random', cache(config.viewcache))
  app.get('/song/random', pathslash.dropPathSlash, function (req, res, next) {
    var _songs = db('songs').filter(function(song){
      return song.published
    })
    var _song = _.sample(_songs)
    res.redirect(_song.mediaid)
  })

  app.get('/song/:mediaid', cache(config.viewcache))
  app.get('/song/:mediaid', pathslash.dropPathSlash, function (req, res, next) {
    var _songs = db('songs').filter(function(song){
      return song.published
    })
    var _song, index
    _.any(_songs, function(s, i){
      if (s.mediaid === req.params['mediaid']) {
        _song = s
        index = i
        return true
      }
    })
    // fixme: 不行
    //var acceptsmedia = !req.accepts('html')
    var acceptsmedia = false
    if (!_song) { // 不存在则返回列表 附带notfound标识
      if (acceptsmedia) {
        res.status(404).end()
      } else {
        res.redirect('../songlist?songnotfound=1')
      }
      return
    }
    var song = _.cloneDeep(_song)
    fillsong(song)
    if (acceptsmedia) {
      return res.redirect('../' + song.filepath)
    }

    // 上/下一首关联
    song.prev = _songs[index+1] || null
    song.next = _songs[index-1] || null

    res.__tmpl = 'song'
    res.__data = {
      rndcode: Math.random(),
      pagetitle: (song.author + ': ') +
        song.title + ' - ' + song.lengthstr,
      song: song
    }

    _song.plays += 1 // 播放量+1
    db.save()
    next()
  })
}

function between(v, a, b){
  v = Math.max(v, a)
  v = Math.min(v, b)
  return v
}
function prefixurl(s){
  return config.urlprefix + s
}
