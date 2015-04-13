app.initAdmin = function () {
  app.entry = window.location.origin + window.location.pathname;
  // 微信分享
  app.wxImg = app.entry + '../logo.jpg';
  app.wxLink = app.entry;
  app.wxTitle = '一分钟歌声';
  app.wxDesc = '';

  var wxData = function() {
    return {
      // 这里需要特别说明的是，建议不要用新浪微博的图片地址，要么你试试，哈哈
      'img': app.wxImg,
      'link': app.wxLink,
      'desc': app.wxDesc,
      'title': app.wxTitle
    };
  };
  //wechat('friend', wxData, wxCallback);     // 朋友
  //wechat('timeline', wxData, wxCallback);   // 朋友圈
  //wechat('weibo', wxData, wxCallback);      // 微博

  function wxCallback(res) {
    console.log(JSON.stringify(res))
  }

  $('#logout').on('click', function(){
    $.post('/admin/op/logout', function(){
      app.loadPage('#login')
    })
  })
}

app.showMeta = function () {
  var $meta = $('[data-bind="meta"]');
  $.get('../meta/get', function (data) {
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