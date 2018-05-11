var wxconnect = require('./lib/wxconnect')
var db = require('./db')
var config = require('../../config')
var fillsong = require('./lib/fillsong')
var _ = require('lodash')
var Wxpub = require('./wxpub')
var async = require('async')
var fs = require('fs')
var datestr = require('./lib/datestr')
var clearsong = require('./lib/clearsong')
module.exports = wxapp

function wxapp(mainapp){
  var pubs = []
  _.each(config.wxs, function(data){
    var pub = new Wxpub(data)
    pubs[data.rawid] = pub
  })

  // 抓取公众号语音
  var pickupvoice = _.throttle(function(rawid){
    var pub = pubs[rawid]
    var dbsongs = db('songs')
    console.log(pub.data.rawid + ' pickupvoice round begin')
    pub.getmsglist(function(err, msgs){
      if (err) {
        console.error(pub.data.rawid, 'getmsglist error', err)
        return
      }
      var period = 30*60*1000 // 抓取区间30分钟
      msgs = msgs.reverse() // 按时间升序
      console.log(pub.data.rawid, msgs.length + ' voices detected')
      msgs = _.filter(msgs, function(msg){
        msg._playlength = Math.round(msg['play_length'] / 1000)
        return msg['type'] === 3 &&
          Date.now() - msg['date_time'] * 1000 < period &&
          msg._playlength >= 15 // 播放长度至少15秒
      })
      console.log(pub.data.rawid, msgs.length + ' voices passed')
      msgs = _.filter(msgs, function(msg){
        msg._mediaid = rawid.slice(-6) + '_' + msg['id']
        return !dbsongs.find({ mediaid: msg._mediaid }) // 未下载
      })
      console.log(pub.data.rawid, msgs.length + ' voices to save')
      var songs = _.map(msgs, function(msg){ // 数据结构转换
        return {
          published: true,
          mediaid: msg._mediaid,
          pubrawid: rawid,
          msgid: msg['id'],
          playlength: msg._playlength,
          _nickname: msg['nick_name'],
          _fakeid: msg['fakeid'],
          localfile: msg._mediaid + '.mp3',
          createtime: datestr.tostr(msg['date_time'] * 1000)
        }
      })
      async.eachSeries(songs, function savevoice(song, next){ // 逐个下载
        next = (function(next){ // hack next
          return function _next(err){
            if (err) {
              console.error(pub.data.rawid, 'savevoice error', song, err)
            } else {
              console.log(pub.data.rawid, 'savevoice success', song)
            }
            _.delay(function(){
              next(null) // 忽略err继续
            }, 3000) // 等待3秒继续
          }
        })(next)
        pub.getvoicedata(song.msgid, function(err, buf){
          if (err) return next(err)
          fs.writeFile(config.mediadir + '/' + song.localfile, buf, function(err){
            if (err) return next(err)
            clearsong(song)
            dbsongs.push(song)
            db.save()
            next(null)
          })
        })
      }, function(){
        console.log(pub.data.rawid, 'pickupvoice round complete')
      })
    })
  }, config.pickthrottle) // 每x秒最多抓取一次

  // 自动触发一次抓
  _.each(config.wxs, function(data){
    var pub = pubs[data.rawid]
    pickupvoice(data.rawid)
  })

  var app = wxconnect({
    appToken: config.wxsapptoken
  })
  var welcome = [
    '欢迎来到【微信唱吧】',
    '回复数字1 - 随机听',
    '直接发语音 - 送上你的歌声',
    config.siteurl
  ].join('\n')

  app.voice = function(req, res){
    var msg = req.message
    var rawid = msg.toUserName
    /*db('voicemsgs').push({
      mediaid: msg.mediaId,
      format: msg.format,
      username: msg.fromUserName,
      pubrawid: rawid,
      createtime: msg.createTime
    })
    db.save()*/
    res.text([
      '歌曲提交成功，非常感谢，歌曲将自动上榜。',
      '你也可以提供自定的歌曲标题、演唱者名称，',
      '默认采用微信用户名。\n',
      config.siteurl
    ].join(''))
    _.delay(function(){
      pickupvoice(rawid)
    }, 15000) // 延后15秒抓取
  }

  app.text = function(req, res){
    if (req.message.content === '1') {
      var _song = db('songs').chain()
        .filter(function(sg){
          return sg.published && !sg.wxonly
        }).sample().value()
      var song = _.cloneDeep(_song)
      fillsong(song)
      // 文件名可能有中文 需要encodeURI
      var fileurl = config.siteurl + encodeURI(song.filepath)
      var pageurl = config.siteurl + 'song/' + song.mediaid
      res.reply({
        msgType: 'music',
        content: {
          title: '随机听: ' + song.mediaid.slice(0, 22),
          description: song.title + ' - ' + song.lengthstr,
          // 需要判断accpets
          musicUrl: fileurl,
          hqMusicUrl: fileurl
        }
      })
      return
    }
    res.text(welcome)
  }

  app.subscribe = function(req, res){
    res.text(welcome)
  }

  mainapp.use(config.wxspath, app)
}
