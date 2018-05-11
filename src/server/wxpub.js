var crypto = require('crypto')
var config = require('../../config')
var db = require('./db')
var _ = require('lodash')
var needle = require('needle')
var cookie = require('cookie')

module.exports = Wxpub
var urlhost = 'https://mp.weixin.qq.com'
var headers = {
  'Accept-Language': 'zh-CN,zh;q=0.8',
  'Connection': 'keep-alive',
  'Origin': 'https://mp.weixin.qq.com',
  'Host': 'mp.weixin.qq.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.101 Safari/537.36'
}
var viewcount = 100

function Wxpub(data){
  this.data = data
  // this.cookies = {}
  this.cookies = cookie.parse(data.cookie)
  this.token = data.token
  this.msglisturl = null
}

// task queue
Wxpub.prototype.getvoicedata = function getvoicedata(msgid, callback){
  var _self = this
//_self._ensurelogin(function(err){
//  if (err) return callback(err)
  var url = '/cgi-bin/getvoicedata?msgid=' + msgid +
    '&fileid=&token=' + _self.token + '&lang=zh_CN'
  //var url = urlhost + '/cgi-bin/downloadfile?msgid=' +
  //  msgid + '&source=&token=' + _self.token
  needle.get(urlhost + url, {
    parse: false,
    //follow_set_cookies: true,
    cookies: _self.cookies,
    headers: _.defaults({
      'Accept': '*/*',
      'Accept-Encoding': 'identity;q=1, *;q=0',
      'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
      'Range': 'bytes=0-',
      'Referer': _self.msglisturl
    }, headers)
  }, function(err, res, buf){
    if (err) return callback(err)
    if (res.statusCode >= 400) {
      return callback(new Error('4xx or 5xx'))
    }
    if (buf.toString().indexOf('<h2>发生错误') > -1) {
      return callback(new Error('out of date'))
    }
    _.extend(_self.cookies, res.cookies)
    callback(null, buf)
  })
//})
}

Wxpub.prototype.getmsglist = function getmsglist(callback){
  var _self = this
_self._ensurelogin(function(err){
  if (err) return callback(err)
  var url = '/cgi-bin/message?t=message/list&count=' +
    viewcount + '&day=7&token=' + _self.token + '&lang=zh_CN'
  _self.msglisturl = urlhost + url
  needle.get(urlhost + url, {
    parse: false,
    //follow_set_cookies: true,
    cookies: _self.cookies,
    headers: headers
  }, function(err, res, buf){
    if (err) return callback(err)
    try {
      var listjson = buf.toString().match(/list : \((\{.+\})\)/)[1]
      var msglist = JSON.parse(listjson)['msg_item']
    } catch (err) {
      return callback(new Error('msglist invalid'))
    }
    _.extend(_self.cookies, res.cookies)
    callback(null, msglist)
  })
})
}

Wxpub.prototype._ensurelogin = function _ensurelogin(callback){
  var _self = this
  _self._checklogin(function(err, islogin){
    if (err) return callback(err)
    if (islogin) return callback(null)
    _self._login(function(err){
      if (err) {
        console.error(_self.data.rawid, 'login error', err)
        return callback(err)
      }
      console.log(_self.data.rawid, 'login success')
      callback(null)
    })
  })
}

Wxpub.prototype._checklogin = function _checklogin(callback){
  var _self = this
  if (!_self.token) return callback(null, false)
  var url = '/cgi-bin/home?t=home/index' +
    '?lang=zh_C&token='+ _self.token
  needle.get(urlhost + url, {
    parse: false,
    //follow_set_cookies: true,
    cookies: _self.cookies,
    headers: headers
  }, function(err, res, buf){
    if (err) return callback(err)
    var islogin = buf.toString().indexOf('<h2>发生错误') < 0
    _.extend(_self.cookies, res.cookies)
    return callback(null, islogin)
  })
}

Wxpub.prototype._login = function _login(callback){
  var _self = this
  needle.post(urlhost + '/cgi-bin/login', {
      username: _self.data.user,
      pwd: md5(_self.data.pass),
      imgcode: '',
      f: 'json'
  }, {
    parse: false,
    //follow_set_cookies: true,
    cookies: _self.cookies,
    headers: _.defaults({
      'Accept':'*/*',
      'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
      'Referer':'https://mp.weixin.qq.com/',
      'X-Requested-With':'XMLHttpRequest'
    }, headers)
  }, function(err, res, buf){
    if (err) return callback(err)
    try {
      var resobj = JSON.parse(buf.toString())
      var errcode = resobj['base_resp']['ret']
    } catch (err) {
      return callback(new Error('resobj invalid'))
    }
    if (errcode === -6) {
      return callback(new Error('captcha required'))
    }
    if (!_.contains([0, 65201, 65202], errcode)) {
      return callback(new Error('login info incorrect'))
    }
    _self.token = resobj['redirect_url'].match(/token=(.+)$/)[1]
    _.extend(_self.cookies, res.cookies)
    callback(null)
  })
}

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex')
}
