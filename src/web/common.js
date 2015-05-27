if (!window.localStorage) {
  alert('珍爱生命，请选用主流的新版本浏览器');
  //window.location = 'http://www.google.cn/intl/zh-CN/chrome/browser/';
  //location.href = 'http://se.360.cn';
}

var realWeixin = !!navigator.userAgent.match(/MicroMessenger/i);
var fakeWeixin = !!location.search.match(/[\?&](wx$|wx&)/)
var isWeixin = realWeixin || fakeWeixin
if (isWeixin) {
  showshare()
}
function showshare(){
  var _share = document.getElementById('share-friends')
  if (_share) _share.style.display='block'
}

var clkev = 'ontouchend' in window ? 'touchend' : 'click'
