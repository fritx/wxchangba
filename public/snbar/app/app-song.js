app.showSong = function () {
  var id = parseInt(app.params['id']),
    $frame = app.$frame,
    $back = $frame.find('#back')
    $tableSong = $frame.find('#table-song'),
    $msgid = $tableSong.find('#msgid'),   // 千万要防止注入
    $songname = $tableSong.find('#songname'),
    $createtime = $tableSong.find('#createtime'),
    $playlength = $tableSong.find('#playlength'),
    $plays = $tableSong.find('#plays'),
    $audio = $frame.find('#audio'),
    $random = $frame.find('#random'),
    $down = $frame.find('#down'),
    $toggle = $frame.find('#toggle');

  $back.on('click', app.backFromSong);
  $random.on('click', app.gotoRandomSong);

  $.get('/song/view/' + id, function (data) {
    // 如果是字符串则parseJSON
    if (_.isString(data)) data = $.parseJSON(data);
    var msg = data['msg'],
      song = data['song'];
    msg && app.notify(msg);
    if (!song) return window.history.go(-1);  // 歌曲不存在 返回原网页
    var msgId = song['msgid'];
    $msgid.text(msgId);
    $songname.text(song['name']);

    var playlengthStr = song['playlength'] + '″'
    $playlength.text(playlengthStr);

    app.wxLink = window.location.href;
    app.wxDesc = song['name'] + ' - ' + playlengthStr;

    $plays.text(song['plays']);
    $createtime.text(song['createtime'] ? (function (t) {
      var d = new Date(t),
        month = twobits(d.getMonth() + 1),
        day = twobits(d.getDate()),
        hour = twobits(d.getHours()),
        minute = twobits(d.getMinutes());
      return month + '/' + day + ' -  ' + hour + ':' + minute;
    })(song['createtime'] * 1000) : '-');

    $audio.on('ended',function () {
      app.toggleSong(false);
    }).attr('preload', '') // 预加载
    // 加上.mp3后缀 格式友好
    .attr('src', '/song/down/' + msgId + '.mp3'); // 加载歌曲

    $toggle.on('click', app.toggleSong);
      //.find('#play').enable();

    //$down.on('click',function () {
    //  app.downloadSong(msgId);
    //}).enable();
    $down.addClass('external')
      .attr('target', '_blank')
      .attr('href', '/song/down/' + msgId + '.mp3');
  });
}

app.toggleSong = function (flag) {
  var $frame = $('#frame'),
    $toggle = $frame.find('#toggle'),
    $audio = $frame.find('#audio'),
    audio = $audio[0];
  flag = _.isBoolean(flag) ? flag : $toggle.is('.off');
  if (flag) {
    $toggle.removeClass('off').addClass('on');
    audio.play();
  } else {
    $toggle.removeClass('on').addClass('off');
    audio.pause();
  }
}

app.downloadSong = function (id) {
  window.open('/song/down/' + id);
}
app.backFromSong = function () {
  var lastHash = app.lastHash;
  if (/^#songlist/.test(lastHash)) return app.loadPage(lastHash);
  app.loadPage('#songlist');
}
