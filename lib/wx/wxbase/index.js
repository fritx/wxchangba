var _ = require('underscore'),
  WxValidator = require('./validator'),
  WxParser = require('./parser'),
  WxHandler = require('../wx-handler'),
  wxValidator,
  wxParser,
  wxHandler;

var WxBase = module.exports = function (wxConfig) {
  var wxToken = wxConfig.token,
    wxValidGet = wxConfig.validGet,
    wxValidPost = wxConfig.validPost;

  wxValidator = new WxValidator(wxToken, wxValidGet, wxValidPost);
  wxParser = new WxParser();
  wxHandler = new WxHandler();
}

WxBase.prototype.watch = function (app, wxPath) {
  wxValidator.watch(app, wxPath); // 微信验证
  wxHandler.watch(app);
  app.all(wxPath, readXml, replyMsg);
}

function replyMsg(req, res) {
  wxParser.toMsg(req.wxXml, function (err, reqMsg) {
    if (err) {    // 请求无效
      console.warn('Invalid Request: ' + req.wxXml); // 打印无效请求
      return res.send(400);
    }
    req.wxMsg = reqMsg;
    res.wxMsg = {
      toUserName: reqMsg.fromUserName,
      fromUserName: reqMsg.toUserName
    }
    res.sendWxMsg = sendWxMsg;
    // 用户自定义的处理过程
    wxHandler.handle(req, res);
  });
}
function sendWxMsg(obj) {
  var res = this;
  _.extend(res.wxMsg, {
    createTime: Date.now()
  }, obj);
  wxParser.toXml(res.wxMsg, function (err, xml) {
    res.send(xml);
  });
}

function readXml(req, res, next) {
  req.wxXml = '';
  req.on('data', function (chunk) {
    req.wxXml += chunk;
  });
  req.on('end', next);
}
