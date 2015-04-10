var app = {};

app.init = function () {
  window._hmt = window._hmt || [];

  if (!window.localStorage) {
    return alert('你的浏览器不行啊');
  }

  app.$window = $(window);
  app.$document = $(document);
  app.$body = $('body');
  app.$container = $('#container');
  app.$frame = $('#frame');
  app.hash = window.location.hash;
  app.lastHash = null;
  app.params = getHashParams();
  app.lastParams = null;

  app.$window.on('hashchange', function (ev) {
    ev.preventDefault();
    if (window.location.hash === app.hash) return;
    app.loadPage(window.location.hash);
  });

  app.$body.delegate('[href]', 'tap click', function (ev) {
    if ($(this).is('.external') || ev.ctrlKey || ev.shiftKey) {
      return;
    }
    var href = $(this).attr('href');
    if (href && href !== '#') {
      ev.preventDefault();
      app.loadPage(href);
    }
  });
}

app.reloadPage = function (success) {
  app.loadPage(app.hash, success);
}
app.loadPage = function (hash, success) {
  var mat = hash.substr(1).match(/^([^\?]*)(\?[^\?]*)?$/);
  var href = 'frames/' + (mat[1] || '') + '.html' + (mat[2] || '');
  $.get(href, function (html) {
    if (app.lastHash !== app.hash) app.lastHash = app.hash;
    window.location.hash = app.hash = hash;
    app.lastParams = app.params;
    app.params = getHashParams();
    app.$frame.html(html);
    window.scrollTo(0, 0); // 窗口返回最顶
    success && success();
  });
}

app.notify = function (msg) {
  // 有消息则提示
  msg && alert(msg);
  msg && _hmt.push(['_trackEvent', 'app', 'notify', msg]);
}
