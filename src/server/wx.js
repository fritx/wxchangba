var crypto = require('crypto')
var request = require('request')
var config = require('../../config')
var db = require('./db')
var wxSign = require('./lib/wxsign')
var tss = require('./lib/tss')
var url = require('url')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')
//var mime = require('mime-types')
//var needle = require('needle')
var cp = require('child_process')
var wx = module.exports = {}

wx.getShortUrl = function(url, cb){
  reqShortUrl(url, cb)
}
wx.getMaterialList = function(type, offset ,cb){
  reqMaterialList(type, offset, cb)
}
wx.postMaterial = function(type, buf, cb){
  reqPostMaterial(type, buf, cb)
}
wx.getMaterial = function(mediaid ,cb){
  reqMaterial(mediaid, cb)
}
wx.getMedia = function(mediaid, cb){
  reqMedia(mediaid, cb)
}

wx.getJsApiSign = function (req, cb) {
  var referer = req.get('referer') || ''
  var refhost = url.parse(referer).hostname
  if (!_.any(config.wxm.trustedhosts, function(host){
    return isOf(host, refhost)
  })) {
    return cb(new Error('host not trusted'))
  }
  wx.getJsApiTicket(function (e, d) {
    if (e) return cb(e)
    //var sign = wxSign(d.jsapi_ticket, fullUrl(req))
    var sign = wxSign(d.jsapi_ticket, referer)
    sign.appId = config.wxm.appid
    cb(null, sign)
  })
}

wx.getJsApiTicket = function (cb) {
  var dbJsApiTicket = db('jsapi_ticket')
  var item = dbJsApiTicket.first()
  if (item && item.deadline - tss() > 60) {
    return cb(null, item)
  }
  reqJsApiTicket(function (e, d) {
    if (e) return cb(e)
    item = {
      jsapi_ticket: d.ticket,
      deadline: d.expires_in + tss()
    }
    dbJsApiTicket.remove()
    dbJsApiTicket.push(item)
    db.save()
    cb(null, item)
  })
}
wx.getAccessToken = function (cb) {
  var dbAccessToken = db('access_token')
  var item = dbAccessToken.first()
  if (item && item.deadline - tss() > 60) {
    return cb(null, item)
  }
  reqAccessToken(function (e, d) {
    if (e) return cb(e)
    item = {
      access_token: d.access_token,
      deadline: d.expires_in + tss()
    }
    dbAccessToken.remove()
    dbAccessToken.push(item)
    db.save()
    cb(null, item)
  })
}

function reqShortUrl(longurl, cb){
  wx.getAccessToken(function (e, d) {
    if (e) return cb(e)
    var requrl = 
      'https://api.weixin.qq.com/cgi-bin/shorturl' +
      '?access_token=' + d.access_token
    request({
      method: 'POST',
      url: requrl,
      form: JSON.stringify({
        action: 'long2short',
        long_url: longurl
      }),
      json: true
    }, function(e, r, d){
      if (e) return cb(e)
      if (d.errcode) {
        return cb(new Error(
          d.errcode + ': ' + d.errmsg
        ))
      }
      cb(null, d)
    })
  })
}
function reqPostMaterial(type, file, cb){
  wx.getAccessToken(function (e, d) {
    if (e) return cb(e)
    var url =
      'https://api.weixin.qq.com/cgi-bin/material/add_material' +
      '?access_token=' + d.access_token
    //var filesize = fs.statSync(file).size
    //var mimetype = mime.lookup(file)

    // 请求库无法达到要求
    // 不得已 使用curl命令行调用
    // 注意防御注入
    cp.exec('curl "'+ url +'" -F media=@"' + file + '"', function(e, sout, serr){
      if (e) return cb(e)
      try {
        var d = JSON.parse(sout)
      } catch(e) {
        return cb(e)
      }
      if (d.errcode) {
        return cb(new Error(
          d.errcode + ': ' + d.errmsg
        ))
      }
      cb(null, d)
    })
    /*needle.post(url, {
      'type': type,
      'media': {
        file: file,
        content_length: filesize,
        content_type: mimetype
      }
    }, { multipart: true }, function(e, r, d){
      console.log(e)
      console.log(d)
    })*/
    /*var formData = {
      type: type,
      media: {
        value: fs.createReadStream(file),
        options: {
          'filename': path.basename(file),
          'content-length': filesize,
          'filelength': filesize,
          'contentType': mimetype,
          'content-type': mimetype
        }
      }
    }
    request({
      method: 'POST',
      url: url,
      formData: formData
    }, function (e, r, d) {
      if (e) return cb(e)
      if (r.statusCode >= 400) {
        return cb(new Error('4xx or 5xx'))
      }
      cb(null, d)
    })*/
  })
}
function reqMaterial(mediaid, cb) {
  wx.getAccessToken(function (e, d) {
    if (e) return cb(e)
    var url =
      'https://api.weixin.qq.com/cgi-bin/material/get_material' +
      '?access_token=' + d.access_token
    request({
      method: 'POST',
      url: url,
      form: JSON.stringify({
        media_id: mediaid
      }),
      encoding: null
    }, function (e, r, b) {
      if (e) return cb(e)
      if (r.statusCode >= 400) {
        return cb(new Error('4xx or 5xx'))
      }
      cb(null, b)
    })
  })
}
function reqMedia(mediaid, cb) {
  wx.getAccessToken(function (e, d) {
    if (e) return cb(e)
    var url =
      'https://api.weixin.qq.com/cgi-bin/media/get' +
      '?access_token=' + d.access_token + '&media_id=' + mediaid
    request({
      url: url,
      encoding: null
    }, function (e, r, b) {
      if (e) return cb(e)
      if (r.statusCode >= 400) {
        return cb(new Error('4xx or 5xx'))
      }
      cb(null, b)
    })
  })
}
function reqMaterialList(type, offset, cb) {
  wx.getAccessToken(function (e, d) {
    if (e) return cb(e)
    var url =
      'https://api.weixin.qq.com/cgi-bin/material/batchget_material' +
      '?access_token=' + d.access_token
    request({
      method: 'POST',
      url: url,
      form: JSON.stringify({
        type: type,
        offset: offset,
        count: 20
      }),
      json: true
    }, function (e, r, d) {
      if (e) return cb(e)
      if (d.errcode) {
        return cb(new Error(
          d.errcode + ': ' + d.errmsg
        ))
      }
      cb(null, d)
    })
  })
}
function reqJsApiTicket(cb) {
  wx.getAccessToken(function (e, d) {
    if (e) return cb(e)
    var reqJsApiTicketUrl =
      'https://api.weixin.qq.com/cgi-bin/ticket' +
      '/getticket?access_token=' +
      d.access_token +
      '&type=jsapi'
    request({
      url: reqJsApiTicketUrl,
      json: true
    }, function (e, r, d) {
      if (e) return cb(e)
      if (d.errcode) {
        return cb(new Error(
          d.errcode + ': ' + d.errmsg
        ))
      }
      cb(null, d)
    })
  })
}
function reqAccessToken(cb) {
  var reqAccessTokenUrl =
    'https://api.weixin.qq.com/cgi-bin/token' +
    '?grant_type=client_credential&appid=' +
    config.wxm.appid +
    '&secret=' +
    config.wxm.appsecret
  request({
    url: reqAccessTokenUrl,
    json: true
  }, function (e, r, d) {
    if (e) return cb(e)
    if (d.errcode) {
      return cb(new Error(
        d.errcode + ': ' + d.errmsg
      ))
    }
    cb(null, d)
  })
}

// 判断sub是否为str的子域名
function isOf(sub, str) {
  var i = str.indexOf(sub)
  return i === str.length - sub.length &&
    (str[i-1] == null || str[i-1] === '.')
}
