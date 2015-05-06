var _ = require('underscore')
var fs = require('fs')
//var quicklogin = require('quick-login')

module.exports = function(app){

  // 管理员访问过程
  /*app.use('/admin', quickLogin(function(data, next){
    var user = {
      username: data.name,
      password: data.pass
    };
    var admin = _.findWhere(config.admin, user);
    next(null, admin);
  }));*/
  app.all('/admin/op/*', function (req, res, next) {
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
      return _.findWhere(app.get('config').admin, user);
    }
    next();
  });
  // 管理员登录
  app.get('/admin/op/login', function (req, res) {
    if (req.getUser()) return res.send({});
    res.send({ 'err': 1 });
  });
  app.post('/admin/op/login', function (req, res) {
    req.clearUser();
    var user = {
      username: req.body['user'],
      password: req.body['pass']
    }
    if (!req.isAdmin(user)) return res.send({
      'err': 1, 'msg': '登录失败'
    });
    req.setUser(user);
    res.send({ 'msg': '登录成功' });
  });
  // 管理员登出
  app.post('/admin/op/logout', function (req, res) {
    if (!req.getUser()) return res.send({ 'msg': '未登录' });
    req.clearUser();
    res.send({ 'msg': '退出成功' });
  });
  // 管理员认证过程
  app.all('/admin/op/*', function (req, res, next) {
    if (!req.isAdmin()) return res.send({ 'msg': '请登录管理员' });
    next();
  });

  // 管理员 编辑歌曲
  app.post('/admin/op/song/update/:id', function(req, res){
    var songColl = app.get('songColl'),
      msgId = parseInt(req.params['id']);
    var song = {
      published: !!req.body['published'],
      msgid: parseInt(req.body['msgid']),
      name: req.body['name'],
      playlength: parseInt(req.body['playlength']),
      plays: parseInt(req.body['plays']),
      createtime: req.body['createtime']
    }
    var t = new Date(song.createtime).getTime()
    song.createtime = isNaN(t) ? null : parseInt(t / 1000)
    songColl.update({ msgid: msgId }, {
      $set: song
    }, function (err) {
      if (err) return res.send({ err: err, 'msg': '保存不成功' });
      res.send({ 'msg': '保存成功' });
    });
  })

  // 管理员 歌曲列表
  app.get('/admin/song/list', function (req, res) {
    var songColl = app.get('songColl'),
      rank = req.query['rank'],
      limit = parseInt(req.query['limit']) || undefined,
      skip = parseInt(req.query['skip']) || 0,
      sorts = {
        'latest': { msgid: -1 },
        'hottest': { plays: -1, msgid: 1 }
      }
    songColl.count({
      //published: true
    }, function (err, total) {
      songColl.find({
        //published: true
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

  // 管理员 查阅歌曲
  app.get('/admin/song/view/:id', function (req, res) {
    var msgId = parseInt(req.params['id']);
    songColl.findOne({
      //published: true,
      msgid: msgId
    }, {
      // 提取相应的列
      fields: ['msgid', 'name', 'playlength', 'plays', 'createtime', 'published']
    }, function (err, song) {
      if (!song) return res.send({ msg: '歌曲不存在' });
      res.send({ song: song });
    });
  });

  // 管理员 歌曲抽样
  app.get('/admin/song/sample', function (req, res) {
    var songColl = app.get('songColl'),
      limit = parseInt(req.query['limit']) || 1;
    songColl.count({
      //published: true
    }, function (err, total) {
      songColl.find({
        //published: true
      }, {
        limit: limit,
        skip: Math.floor(Math.random() * total),
        fields: ['msgid']      // 提取相应的列
      }).toArray(function (err, songs) {
          res.send({ songs: songs });
        });
    });
  });

  // 管理员 播放/下载歌曲
  app.get('/admin/song/down/:file', function (req, res) {
    var file = req.params['file'],
      msgId = parseInt(file),
      filePath = app.getSongFilePathById(msgId);
    if (!fs.existsSync(filePath)) return res.send(404);    // 文件要存在
    songColl.findOne({
      //published: true,
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

}