var http = require('http'),
  path = require('path'),
  fs = require('fs'),
  _ = require('underscore'),
  async = require('async'),
  express = require('express'),
  mode = (process.argv && process.argv[2]) || 'ecs', // 运行模式
  config = require('./config/')(mode),
  app = express(),
  Mongo = require('./lib/mongo'),
  wxVoiceThief = require('./lib/wx/wx-voice-thief'),
  WxBase = require('./lib/wx/wxbase/'),
  wxBase = new WxBase(config.wx),
  adminAccounts = require('./private/admin-accounts');

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
    http.createServer(app).on('error',function (err) {
      callback(Error('Port ' + config.port + ' Occupied'));
    }).listen(config.port, function () {
        callback(null, db, config.port);
      });
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
  wxVoiceThief.init(config.wx.account);
  // 抓取voice
  setInterval(function () {
    wxVoiceThief.steal(function (err, msgs) {
      if (err) {
        console.error(err);
        return;
      }
    
    async.each(msgs, function(msg, next){
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
      if (playLength / 1000 < config.wx.minSeconds) {   // 时间不够长
        //return res.sendWxMsg({
        //  msgType: 'text',
        //  content: '你的歌声好像不够' + minSeconds + '秒哦'
        //});
        return next(null);
      }

      // 保存文件
      var filepath = path.join(songDir, msgId + '.' + config.wx.voiceFormat);
      fs.exists(filepath, function(exists){
        if (exists) return;
      fs.writeFile(filepath, msg._buf, function (err) {
        if (err) return console.error(err);
        console.info('New song file saved: ' + msgId);
      });
      });

      // 保存记录
      songColl.findOne({
        msgid: msgId
      }, function(err, item){
        if (item) return;
      var song = {
        published: true,
        name: '歌曲 '+ msgId,
        plays: 0,
        msgid: msgId,
        //username: msg[''],
        fakeid: msg['fakeid'],
        nickname: msg['nick_name'],
        createtime: msg['date_time'],  // 单位 s
        playlength: Math.max(1, Math.round(playLength / 1000))  // 单位 s
      }
      songColl.insert(song, function (err, docs) {
        console.info('New song added: ' + msgId);
      });
      });

    });
      // 跳转activity
      //self.activityHash['submit'].welcome(req, res);
    });
  }, 1000 * 40); // 40s






  // 使用 wxbase
  wxBase.watch(app, config.wxPath);

  app.get('/', function (req, res) {
    res.redirect('/snbar/');
  });


  /* Meta信息提取 */
  app.get('/meta/get', function (req, res) {
    var meta = app.get('config').meta;
    res.send({ 'meta': meta });
  });

  /* 管理员后台 */
  // 管理员访问过程
  app.all('/admin/*', function (req, res, next) {
    req.clearUser = function () {
      delete req.session['user'];
    }
    req.setUser = function (user) {
      req.session['user'] = user;
    }
    req.getUser = function (user) {
      return req.session['user'];
    }
    req.isAdmin = function (user) {
      var user = user || req.getUser();
      return _.findWhere(adminAccounts, user);
    }
    next();
  });
  // 管理员登录
  app.post('/admin/login', function (req, res) {
    req.clearUser();
    var user = {
      username: req.body['user'],
      password: req.body['pass']
    }
    if (!req.isAdmin(user)) return res.send({});
    req.setUser(user);
    res.send({ 'msg': '登录成功' });
  });
  // 管理员登出
  app.post('/admin/logout', function (req, res) {
    if (!req.getUser()) return res.send({ 'msg': '未登录' });
    req.clearUser();
    res.send({ 'msg': '退出成功' });
  });
  // 管理员认证过程
  app.all('/admin/*', function (req, res, next) {
    if (!req.isAdmin()) return res.send({ 'msg': '请登录管理员' });
    next();
  });
  // 查看内容文件列表
  app.get('/admin/content/list', function (req, res) {
    var contentDir = config.dirs.content,
      dir = req.query['dir'] || '',
      dirpath = path.join(contentDir, dir);
    if (!fs.existsSync(dirpath)
      || !fs.statSync(dirpath).isDirectory()) return res.send({ 'msg': '目录不存在' });
    fs.readdir(dirpath, function (err, files) {
      res.send({ 'files': files });
    });
  });
  // 删除内容文件
  /*app.post('/admin/content/del', function(req, res) {
   var contentDir = config.dirs.content,
   thepath = req.body['file'] || '',
   filepath = path.join(contentDir, thepath);
   if (! fs.existsSync(filepath)
   || fs.statSync(filepath).isDirectory()) return res.send({ 'msg': '文件不存在' });
   fs.unlink(filepath, function(err) {
   if (err) return res.send({
   'err': err, 'msg': '删除不成功'
   });
   res.send({ 'msg': '删除成功' });
   });
   });*/
  // 提取DB集合数据
  app.get('/admin/data/export/:coll', function (req, res) {
    var collname = req.params['coll'],
      db = app.get('db');
    db.collectionNames(function (err, colls) {
      var names = _.map(colls, function (coll) {   // remove the prefix
        return coll.name.match(/[^\.]+\.(.+)/)[1];
      });
      if (!_.contains(names, collname)) return res.send({ 'msg': '集合不存在' });
      db.collection(collname, function (err, coll) {
        coll.find({}).toArray(function (err, docs) {
          res.send({ 'docs': docs });
        });
      });
    });
  });
  // 管理员删除歌曲
  app.post('/admin/song/del/:id', function (req, res) {
    var songColl = app.get('songColl'),
      msgId = parseInt(req.params['id']);
    songColl.findOne({ msgid: msgId }, function (err, song) {
      if (!song) return res.send({ 'msg': '歌曲不存在' });
      var filePath = app.getSongFilePathById(msgId);
      songColl.remove({ msgid: msgId }, function (err, num) {
        if (err) return res.send({
          'err': err, 'msg': '删除记录不成功'
        });
        fs.unlink(filePath, function (err) {
          if (err) return res.send({
            'err': err, 'msg': '删除文件不成功'
          });
          res.send({ 'msg': '删除成功' });
        });
      });
    });
  });

  /* 歌曲访问 */
  // 歌曲列表
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
  app.get('/song/list', function (req, res) {
    var songColl = app.get('songColl'),
      rank = req.query['rank'],
      limit = parseInt(req.query['limit']) || undefined,
      skip = parseInt(req.query['skip']) || 0,
      sorts = {
        'latest': { msgid: -1 },
        'hottest': { plays: -1, msgid: 1 }
      }
    songColl.count({
      published: true
    }, function (err, total) {
      songColl.find({
        published: true
      }, {
        sort: sorts[rank] || sorts['latest'],
        limit: limit,
        skip: skip,
        fields: ['msgid', 'name', 'plays']     // 提取相应的列
      }).toArray(function (err, songs) {
          res.send({
            total: total, songs: songs
          });
        });
    });
  });
  // 歌曲抽样
  app.get('/song/sample', function (req, res) {
    var songColl = app.get('songColl'),
      limit = parseInt(req.query['limit']) || 1;
    songColl.count({
      published: true
    }, function (err, total) {
      songColl.find({
        published: true
      }, {
        limit: limit,
        skip: Math.floor(Math.random() * total),
        fields: ['msgid']      // 提取相应的列
      }).toArray(function (err, songs) {
          res.send({ songs: songs });
        });
    });
  });
  // 播放/下载歌曲
  app.get('/song/down/:file', function (req, res) {
    var file = req.params['file'],
      msgId = parseInt(file),
      filePath = app.getSongFilePathById(msgId);
    if (!fs.existsSync(filePath)) return res.send(404);    // 文件要存在
    songColl.findOne({
      published: true,
      msgid: msgId
    }, function (err, song) {
      if (!song) return res.send(404);   // 记录要存在
      var downname = msgId + '- ' + song.name;    // 文件名
      res.download(filePath, encodeURI(downname));
      // 真实播放判断 待改善
      var headers = req.headers,
        firstPlay = headers['range'] !== 'bytes=0-'
          && headers['range'] !== 'bytes=0-1';
      if (firstPlay) {
        songColl.update({ 'msgid': msgId }, {
          $inc: { plays: 1 }    // 更新播放次数
        }, { w: 0 });
      }
    });
  });
  // 查阅歌曲
  app.get('/song/view/:id', function (req, res) {
    var msgId = parseInt(req.params['id']);
    songColl.findOne({
      published: true,
      msgid: msgId
    }, {
      // 提取相应的列
      fields: ['msgid', 'name', 'playlength', 'plays', 'createtime']
    }, function (err, song) {
      if (!song) return res.send({ msg: '歌曲不存在' });
      res.send({ song: song });
    });
  });

  // 静态资源
  app.use('/assets', express.static(config.dirs.assets));
  app.use(express.static(config.dirs.public));
  app.use('/songs', express.static(config.dirs.songs));
  console.log('服务已启动 端口:' + port);
});
