app.initIndex = function () {
  app.isWeixin = !!navigator.userAgent.match(/MicroMessenger/i);
  if (app.isWeixin) {
    $('#share-friends').show();
  }
}

app.showMeta = function () {
  var $meta = $('[data-bind="meta"]');
  $.get('meta/get', function (data) {
    // 如果是字符串则parseJSON
    if (!_.isObject(data)) data = $.parseJSON(data);
    var meta = data['meta'];
    if (!meta) throw new Error('Meta信息加载失败');
    // 信息部署
    _.each(meta, function (val, key) {
      $meta.filter('[data-name="' + key + '"]').text(val);
    });
  });
}

app.gotoRandomSong = function () {
  _hmt.push(['_trackEvent', 'app', 'random', 'song']);
  $.get('song/sample', { 'limit': 1 }, function (data) {
    // 如果是字符串则parseJSON
    if (!_.isObject(data)) data = $.parseJSON(data);
    var songs = data['songs'];
    if (!songs) throw new Error('歌曲加载失败');
    if (!songs.length) return app.notify('一首歌都没有..');
    app.loadPage('#song?id=' + songs[0].msgid);
  });
}
