// if not supported by Zepto
if (typeof $ === 'undefined') {
  alert('珍爱生命 远离IE\n请换用新版IE或其他主流浏览器');
  //window.location = 'http://www.google.cn/intl/zh-CN/chrome/browser/';
  window.location = 'http://se.360.cn';
}

function twobits(num) {
  return (num < 10 ? '0' : '') + num;
}

function getSearchParams(str) {
  return getUrlParams(str || window.location.search);
}
function getHashParams(str) {
  return getUrlParams(str || window.location.hash);
}
function getUrlParams(url) {
  var pat = /([^?=&#]*)=([^?=&#]+)/g, params = {};
  decodeURIComponent(url)
    .replace(pat, function (a, b, c) {
      params[b] = c;
    });
  return params;
}

$.fn.enable = function () {
  return $(this).each(function (i, el) {
    $(el).removeAttr('disabled');
  });
}
$.fn.disable = function () {
  return $(this).each(function (i, el) {
    $(el).attr('disabled', true);
  });
}
