var http = require('http'),
  path = require('path'),
  fs = require('fs'),
  _ = require('underscore'),
  async = require('async'),
  express = require('express'),
  mode = (process.argv && process.argv[2]) || 'example', // 运行模式
  config = require('./config/')(mode),
  app = module.exports = express(),
  Mongo = require('./lib/mongo'),
  WxVoiceThief = require('./lib/wx/wx-voice-thief'),
  wxVoiceThieves = _.map(config.wxacc, function(account){
    return new WxVoiceThief(account);
  }),
  WxBase = require('./lib/wx/wxbase/'),
  wxBase = new WxBase(config.wx);

// 确保目录存在
_.each(config.dirs, function (dir) {
  fs.existsSync(dir) || fs.mkdir(dir);
});
app.set('env', config.env);
app.set('config', config);
app.use(express.favicon());
app.use(express.bodyParser({
  uploadDir: config.dirs.tmp
}));
app.use(express.cookieParser());
app.use(express.session({
  secret: config.secret
}));

async.waterfall([
  function (callback) {
    var mgConfig = config.mongo,
      mongo = new Mongo(mgConfig.host, mgConfig.port, mgConfig.dbname);
    mongo.open(function (err, db) {
      callback(err, db);
    }, mgConfig.user);
  },
  function (db, callback) {
    var server = http.createServer(app).on('error',function (err) {
      callback(Error('Port ' + config.port + ' Occupied'));
    });
    if (!module.parent) {
      server.listen(config.port, function () {
        callback(null, db, config.port);
      });
    } else {
      callback(null, db, config.port);
    }
  }
], function (err, db, port) {
  if (err) throw err;
  var userColl = db.collection('users');
  var presongColl = db.collection('presongs');
  var songColl = db.collection('songs');

  app.set('db', db);
  app.set('userColl', userColl);
  app.set('presongColl', presongColl);
  app.set('songColl', songColl);


  // 登录账号
  _.each(wxVoiceThieves, function(thief){
  thief.init();
  // 抓取voice
  setInterval(function () {
    thief.steal(function (err, msgs) {
      console.info(thief.wxAccount.username);
      if (err) {
        console.error(err);
        return;
      }
      console.info('Media stolen: ', _.pluck(msgs, 'id'));

      msgs = _.reject(msgs, function(msg){
        var playLength = msg['play_length'];
        return Math.ceil(playLength / 1000) < config.wx.minSeconds;
      });
    
    async.eachSeries(msgs, function(msg, next){
      var msgId = msg['id'],
        //fakeId = msg['fakeid'],
        //nickname = msg['nick_name'],
        playLength = msg['play_length'];
      // 更新用户nickname和fakeid
      //var userExt = {
      //  fakeid: fakeId,
      //  nickname: nickname
      //}
      //_.extend(user, userExt);
      //userColl.update({
      //  username: user.username
      //}, {
      //  $set: userExt
      //}, function (err, num) {
      //  console.info('User profile expanded: ' + user.username);
      //});

      // 保存记录
      songColl.findOne({
        msgid: msgId
      }, function(err, item){
        if (item) return next(null);

      // 保存文件
      var filepath = path.join(songDir, msgId + '.' + config.wx.voiceFormat);
      next = (function(fn){ // 强制延后next 避免微信hangup
        return function(err){
          setTimeout(function(){
            fn(err);
          }, 1000);
        }
      })(next);
      msg._getbuf(function(err, buf){
      if (err) {
        console.error(err);
        return next(null);
      }
      try {
        fs.writeFileSync(filepath, buf);
      } catch(err) {
        console.error(err);
        return next(null);
      }
      console.info('New song file saved: ' + msgId);

      var song = {
        published: true,
        name: '歌曲 '+ msgId,
        plays: 0,
        msgid: msgId,
        //username: msg[''],
        fakeid: msg['fakeid'],
        nickname: msg['nick_name'],
        createtime: msg['date_time'],  // 单位 s
        playlength: Math.max(1, Math.ceil(playLength / 1000))  // 单位 s
      }
      songColl.insert(song, function (err, docs) {
        console.info('New song added: ' + msgId);
        next(null);
      });
      });
      // 跳转activity
      //self.activityHash['submit'].welcome(req, res);
    });
    });
    });
  }, 1000 * 30); // 30s
  });

  // 使用 wxbase
  wxBase.watch(app, config.wx.path);

  // Meta信息提取
  app.get('/meta/get', function (req, res) {
    var meta = app.get('config').meta;
    res.send({ 'meta': meta });
  });

  app.getSongFilenameById = function (id) {
    var config = app.get('config'),
      voiceFormat = config.wx.voiceFormat;
    return id + '.' + voiceFormat;
  }
  app.getSongFilePathById = function (id) {
    var config = app.get('config'),
      songDir = config.dirs.songs,
      filename = app.getSongFilenameById(id);
    return path.join(songDir, filename);
  }

  // 基础功能
  require('./route/base')(app)

  // 管理功能
  require('./route/admin')(app)

  // 静态资源
  app.use('/assets', express.static(config.dirs.assets));
  app.use(express.static(config.dirs.public));
  app.use('/songs', express.static(config.dirs.songs));
  console.log('服务已启动 端口:' + port);
});
