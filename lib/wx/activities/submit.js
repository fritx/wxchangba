var util = require('util'),
  path = require('path'),
  fs = require('fs'),
  _ = require('underscore'),
  Activity = require('./activity'),
  userColl, presongColl, songColl,
  config, presongDir,
  maxNameLength, voiceFormat;

var SubmitActivity = module.exports = function () {
  Activity.call(this);
}
util.inherits(SubmitActivity, Activity);

SubmitActivity.prototype.watch = function (app, hash) {
  this.activityHash = hash;
  config = app.get('config');
  presongDir = config.dirs.presongs;
  songDir = config.dirs.songs;
  maxNameLength = config.wx.maxNameLength;
  voiceFormat = config.wx.voiceFormat;
  userColl = app.get('userColl');
  presongColl = app.get('presongColl');
  songColl = app.get('songColl');
}
SubmitActivity.prototype.act = function (req, res) {
  var reqMsg = req.wxMsg,
    msgType = reqMsg.msgType;
  switch (msgType) {
    case 'text':
      this.actText(req, res);
      break;
    default:
      this.welcome(req, res);
  }
}
SubmitActivity.prototype.actText = function (req, res) {
  var txt = req.wxMsg.content,
    user = req.wxUser;
  if (txt === '0') {
    // remove presong
    presongColl.findAndRemove({
      username: user.username
    }, {
      sort: [
        ['msgid', -1]
      ]
    }, function (err, presong) {
      var msgid = presong.msgid;
      console.info('PreSong removed: ' + msgid);
      var filePath = path.join(presongDir, msgid + '.' + voiceFormat);
      fs.unlink(filePath, function (err) {
        console.info('Presong file deleted: ' + msgid);
      });
    });
    this.activityHash['root'].welcome(req, res);
  } else {
    presongColl.findAndRemove({
      username: user.username
    }, {
      sort: [
        ['msgid', -1]
      ]
    }, function (err, presong) {
      var msgId = presong.msgid;
      console.info('PreSong removed: ' + msgId);
      // presong转为song
      var oldPath = path.join(presongDir, msgId + '.' + voiceFormat),
        newPath = path.join(songDir, msgId + '.' + voiceFormat);
      /*fs.rename(oldPath, newPath, function(err) {
       console.log(oldPath, newPath);
       if (err) return console.error(err);
       console.info('PreSong file renamed to song: ' + msgId);
       });*/
      // 上者BAE报错: EIO
      fs.readFile(oldPath, function (err, data) {
        fs.writeFile(newPath, data, function (err) {
          fs.unlink(oldPath, function (err) {
            console.info('PreSong file renamed to song: ' + msgId);
          });
        });
      });
      var song = _.extend({}, presong, {
        name: txt.trim().slice(0, maxNameLength) || ('歌曲 ' + msgId),
        plays: 0
      });
      songColl.insert(song, function (err, docs) {
        console.info('New song added: ' + msgId);
      });
    });
    res.sendWxMsg({
      msgType: 'text',
      content: '灰常感谢 歌声已提交'
    });
    // activity记录更新
    userColl.update({
      username: user.username
    }, {
      $set: {
        activity: 'root'
      }
    }, {w: 0});
  }
}
SubmitActivity.prototype.welcome = function (req, res) {
  var self = this,
    user = req.wxUser;
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
      '【歌声提交】',
      '回复数字0 - 不提交',
      '回复其他' + maxNameLength + '字以内 - 给歌曲命名'
    ].join('\n')
  });
}
