app.initAdmin = function () {
  $('#logout').on('click', function(){
    $.post('/admin/op/logout', function(){
      app.loadPage('#login')
    })
  })

  document.title = '邑大唱吧-管理平台'
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
