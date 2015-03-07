var util = require('util'),
  path = require('path'),
  fs = require('fs'),
  _ = require('underscore'),
  Activity = require('./activity'),
  config, presongDir,
  logoUrl, songListUrl, songDownUrl,
  loginAccount, minSeconds, voiceFormat,
  userColl, presongColl,
  wxVoiceThief = require('../wx-voice-thief');

var RootActivity = module.exports = function () {
  Activity.call(this);
}
util.inherits(RootActivity, Activity);

RootActivity.prototype.watch = function (app, hash) {
  this.activityHash = hash;
  config = app.get('config');
  presongDir = config.dirs.presongs;
  logoUrl = config.urls.logo;
  songListUrl = config.urls.songList;
  songDownUrl = config.urls.songDown;
  loginAccount = config.wx.loginAccount;
  minSeconds = config.wx.minSeconds;
  voiceFormat = config.wx.voiceFormat;
  userColl = app.get('userColl');
  presongColl = app.get('presongColl');
  songColl = app.get('songColl');
}
RootActivity.prototype.act = function (req, res) {
  var reqMsg = req.wxMsg,
    msgType = reqMsg.msgType;
  switch (msgType) {
    case 'text':
      this.actText(req, res);
      break;
    case 'voice':
      this.actVoice(req, res);
      break;
    default:
      this.welcome(req, res);
  }
}
RootActivity.prototype.actText = function (req, res) {
  var self = this,
    txt = req.wxMsg.content;
  if (txt === '1') {
    songColl.count({
      published: true
    }, function (err, count) {
      songColl.find({
        published: true
      }, {
        limit: 1,
        skip: Math.floor(Math.random() * count)
      }).toArray(function (err, songs) {
          var song = songs[0];
          if (!song) {
            return res.sendWxMsg({
              msgType: 'text',
              content: [
                '一首歌也没有..'
              ].join('\n')
            });
          }
          self.sendSong(res, song);
        });
    });
  } else if (txt === '2') {
    self.sendSongList(res);
  } else {
    this.welcome(req, res);
  }
}
RootActivity.prototype.sendSongList = function (res) {
  res.sendWxMsg({
    msgType: 'news',
    articles: [
      {
        title: '【一分钟歌声】歌曲列表',
        description: '提供你的歌声 也听听别人的歌声',
        // needing a new pic
        picUrl: logoUrl,
        url: songListUrl
      }
    ]
  });
}
RootActivity.prototype.sendSong = function (res, song) {
  var msgid = song.msgid;
  res.sendWxMsg({
    msgType: 'music',
    music: {
      title: '随机听: ' + msgid,
      description: song.name,
      musicUrl: songDownUrl + msgid +'.'+ voiceFormat,
      hqMusicUrl: songDownUrl + msgid +'.'+ voiceFormat
    }
  });
}
RootActivity.prototype.actVoice = function (req, res) {
  var self = this,
    reqMsg = req.wxMsg,
    user = req.wxUser;

  // 直接提示提交成功
  res.sendWxMsg({
    msgType: 'text',
    content: '灰常感谢 歌声已提交'
  });
}
RootActivity.prototype.welcome = function (req, res) {
  var user = req.wxUser;
  // activity记录更新
  userColl.update({
    username: user.username
  }, {
    $set: {
      activity: this.name
    }
  }, {w: 0});
  res.sendWxMsg({
    msgType: 'text',
    content: [
      '欢迎来到【一分钟歌声】',
      '回复数字1 - 随机听',
      '回复数字2 - 歌曲列表网页',
      '回复' + minSeconds + '秒以上语音 - 送上你的歌声'
    ].join('\n')
  });
}
RootActivity.prototype.sorry = function (req, res) {
  res.sendWxMsg({
    msgType: 'text',
    content: [
      'Sorry~ 歌声未入列',
      '请向我们反应以将其入列',
      '直接回复微信公众号即可'
    ].join('\n')
  });
}
