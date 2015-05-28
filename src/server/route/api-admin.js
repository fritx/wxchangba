var datestr = require('../lib/datestr')
var db = require('../db')
var _ = require('lodash')
var config = require('../../../config')
var pathslash = require('../lib/pathslash')
var fillsong = require('../lib/fillsong')
var requser = require('../lib/requser')
var clearsong = require('../lib/clearsong')

module.exports = function(app){
  app.all('/api/admin/*', requser)

  // 管理员登录
  app.get('/api/admin/login', function (req, res) {
    if (req.getUser()) return res.send({});
    res.send({ 'err': 1 });
  });
  app.post('/api/admin/login', function (req, res) {
    req.clearUser();
    var user = {
      user: req.body['user'],
      pass: req.body['pass']
    }
    if (!req.isAdmin(user)) return res.send({
      'err': 1, 'msg': '登录失败'
    });
    req.setUser(user);
    res.send({ 'msg': '登录成功' });
  });
  // 管理员登出
  app.post('/api/admin/logout', function (req, res) {
    if (!req.getUser()) return res.send({ 'msg': '未登录' });
    req.clearUser();
    res.send({ 'msg': '退出成功' });
  });
  // 管理员认证过程
  app.all('/api/admin/*', function (req, res, next) {
    if (!req.isAdmin()) return res.send({ 'msg': '请登录管理员' });
    next();
  });

  // 管理员 编辑歌曲
  app.post('/api/admin/song/update/:mediaid', function(req, res){
    var mediaid = req.params['mediaid']
    var song = db('songs').find({
      mediaid: mediaid
    })
    if (!song) {
      return res.send({ err: 1, msg: '歌曲不存在' })
    }
    var patch = req.body['patch']
    _.each(['title', 'author'], function(k){
      if (patch[k]) song[k] = patch[k]
    })
    _.each(['published'], function(k){
      if (patch[k]) song[k] = patch[k]==='true'
    })
    _.each(['playlength', 'plays'], function(k){
      if (patch[k]) song[k] = parseInt(patch[k]) || 0
    })
    if (patch['createtime']) {
      var date = new Date(patch['createtime'])
      song['createtime'] = isNaN(date.valueOf()) ?
        '-' : patch['createtime']
    }
    if (patch['tags'] != null) {
      var tags = patch['tags'].split(/\s+/)
      tags = _.pull(tags, '微') // 忽略 [微]
      song['tags'] = tags
    }
    if (patch['htags'] != null) {
      var htags = patch['htags'].split(/\s+/)
      song['htags'] = htags
    }
    clearsong(song)
    db.save()
    res.send({ msg: '修改成功' })
  })

  // 管理员添加歌曲
  app.post('/api/admin/song/add', function(req, res){
    var song = req.body['song']
    if (!song.mediaid || !song.title || !song.playlength) {
      return res.send({ err: 1, msg: '内容不完整' })
    }
    _.each(['title', 'author'], function(k){
      song[k] = song[k]
    })
    _.each(['published'], function(k){
      song[k] = song[k]==='true'
    })
    _.each(['playlength', 'plays'], function(k){
      song[k] = parseInt(song[k]) || 0
    })
    // createtime保留自定字符串
    song['createtime'] = song['createtime'] ||
      datestr.tostr(Date.now())
    song['tags'] = song['tags'].split(/\s+/)
    song['htags'] = song['htags'].split(/\s+/)
    clearsong(song)
    db('songs').push(song)
    db.save()
    res.send({ msg: '添加成功' })
  })
}
