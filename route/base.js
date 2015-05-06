var fs = require('fs')

module.exports = function(app){

  // 歌曲列表
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
  
}