﻿var fs = require('fs'),
  crypto = require('crypto'),
  _ = require('underscore'),
  async = require('async'),
  Client = require('./client'),
  viewCount = 60;

function WxVoiceThief(wxAccount){
  this.token = null;
  this.client = new Client('mp.weixin.qq.com');
  this.wxAccount = wxAccount;
}
module.exports = WxVoiceThief;

WxVoiceThief.prototype.init = function() {
  var self = this;
  self.login(self.wxAccount, true);
  // 保持登录状态，token应会相同
  setInterval(function () {
    self.login(self.wxAccount);
  }, 1000 * 60 * 15);	// 15min
  return self;
}
WxVoiceThief.prototype.steal = function(callback) {
  var self = this;
  self.getMsgList(function (err, msgList) {
      if (err) {
        return callback(new Error('Getting MsgList Error'));
      }
      var mediaList = _.where(msgList, {
        'type': 3
      }), msgs = _.filter(mediaList, function (msg) {
        //var diff = msg['date_time'] - createTime;    // 单位 s
        //return diff > -2 && diff < 5;
        return true;
      });
      if (!msgs.length) {
        return callback(new Error('Media Not Found'));
      }

    msgs = msgs.reverse(); // 按时间升序
    _.each(msgs, function(msg, next){
      msg._getbuf = function(callback){
      self.client.get('/cgi-bin/getvoicedata?msgid=' + msg['id'] + '&fileid=&token=' + self.token + '&lang=zh_CN',
        {}, {}, function (err, res, buf) {
          if (err) {
            console.error(err, msg.id, self.wxAccount.username)
          }
          callback(err, buf);
        });
    }
    });
    callback(err, msgs);
  });
  return self;
}

WxVoiceThief.prototype.login = function(wxAccount, firstTime) {
  var self = this;
  //if (firstTime && wxAccount.cookie && wxAccount.token) {
  if (wxAccount.cookie && wxAccount.token) {
    if (firstTime) {
    self.client.setCookie(wxAccount.cookie);
    self.token = wxAccount.token;
    self.getMsgList(function (err, msgList) {
      if (err) {
        throw new Error('Cookie Token Incorrect');
      }
    });
    }
    return;
  }
  self.client.post('/cgi-bin/login', {
    username: wxAccount.username,
    pwd: md5(wxAccount.password),
    imgcode: '',
    f: 'json'
  }, {
    'Accept':'*/*',
    'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin':'https://mp.weixin.qq.com',
    'Referer':'https://mp.weixin.qq.com/',
    'X-Requested-With':'XMLHttpRequest'
  }, function (err, res, buf) {
    if (!buf) {
      //throw new Error('Out of Internet');
      return
    }
    var resTxt = buf.toString(),
      resObj = JSON.parse(resTxt),
      errCode = resObj['base_resp']['ret'];

    if (!_.contains([0, 65201, 65202], errCode)) {
      if (errCode === -6) {
        throw new Error('VerifyCode Needed - Try Emergent Way');
      } else {
        //throw new Error('Login Info Incorrect');
        console.error('Login Info Incorrect')
        return
      }
    } else {
      var homeUrl = resObj['redirect_url'];
      self.token = homeUrl.match(/token=(.+)$/)[1];
    }
  });
}
WxVoiceThief.prototype.getMsgList = function(callback) {
  this.client.get('/cgi-bin/message?t=message/list&count='
    + viewCount + '&day=7&token=' + this.token + '&lang=zh_CN',	// day 7: today
    {}, {}, function (err, res, buf) {
      try {
        var html = buf.toString();
        var listJson = html.match(/list : \((\{.+\})\)/)[1];
        var msgList = JSON.parse(listJson).msg_item;
        callback(null, msgList);
      } catch (err) {
        callback(new Error('Not Yet Login'));
      }
    });
}
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

