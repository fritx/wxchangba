var db = require('../db')
var fs = require('fs-extra')
var path = require('path')
var wxm = require('../wx')
var datestr = require('../lib/datestr')
var clearsong = require('../lib/clearsong')
var config = require('../../../config')

module.exports = function(app){
  app.get('/api/wxsign', function(req, res, next){
    wxm.getJsApiSign(req, function(e, d){
      if (e) return next(e)
      res.send(d)
    })
  })

  app.post('/api/wxrecord', function(req, res, next){
    var _tmpid = req.body['mediaid']
    // 获取临时素材
    wxm.getMedia(_tmpid, function(e, b){
      if (e || !b) return res.status(500).end()
      var mediaid = datestr.tostr3(Date.now()) + '_' + _tmpid.slice(0, 6)
      var localfile = mediaid + '.mp3'
      var filepath = config.mediadir + '/' +  localfile
      // 保存临时素材到本地 web不可播放
      // fixme: 使用管道可以减少一次本地io
      fs.writeFile(filepath, b, function(e){
        if (e) return res.status(500).end()
        // 上传永久素材
        wxm.postMaterial('voice', filepath, function(e, d){
          if (e) return res.status(500).end()
      // 保存永久素材到本地 web可解码
      wxm.getMaterial(d.media_id, function(e, b){
        if (e) return res.status(500).end()
        fs.writeFile(filepath, b, function(e){
          var song = {
            published: true, // 默认发布
            //wxonly: true,
            wxrecord: true,
            _tmpid: _tmpid,
            _mediaid: d.media_id,
            mediaid: mediaid,
            localfile: localfile,
            createtime: datestr.tostr(Date.now()),
            // 根据文件大小估算长度
            playlength: Math.round(b.length / 1.58 / 1000)
          }
          clearsong(song)
          db('songs').push(song)
          db.save()
          res.status(200).end()
        })
      })
        })
      })
    })
  })
}
