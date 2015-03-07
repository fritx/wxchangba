var _ = require('underscore'),
  xml2js = require('xml2js');

var WxParser = module.exports = function () {
}

WxParser.prototype.toXml = function (msg, callback) {
  var error = new Error('Invalid WxMsg');
  if (!msg) return callback(error);
  var xml = '<xml>';
  xml += [
    '<ToUserName><![CDATA[' + msg.toUserName + ']]></ToUserName>',
    '<FromUserName><![CDATA[' + msg.fromUserName + ']]></FromUserName>',
    '<CreateTime>' + msg.createTime + '</CreateTime>',
    '<MsgType><![CDATA[' + msg.msgType + ']]></MsgType>'
  ].join('\n');
  if (msg.msgId) {
    xml += '<MsgId>' + msg.msgId + '</MsgId>';
  }
  if (msg.funcFlag) {
    xml += '<FuncFlag>' + msg.funcFlag + '</FuncFlag>';
  }
  if (msg.msgType === 'text') {
    xml += '<Content><![CDATA[' + msg.content + ']]></Content>';
  } else if (msg.msgType === 'image') {
    xml += '<PicUrl><![CDATA[' + msg.picUrl + ']]></PicUrl>';
  } else if (msg.msgType === 'voice') {
    xml += [
      '<MediaId><![CDATA[' + msg.mediaId + ']]></MediaId>',
      '<Format><![CDATA[' + msg.format + ']]></Format>',
      '<Recognition><![CDATA[' + msg.recognition + ']]></Recognition>'
    ].join('');
  } else if (msg.msgType === 'link') {
    xml += [
      '<Title><![CDATA[' + msg.title + ']]></Title>',
      '<Description><![CDATA[' + msg.description + ']]></Description>',
      '<Url><![CDATA[' + msg.url + ']]></Url>'
    ].join('');
  } else if (msg.msgType === 'event') {
    xml += [
      '<Event><![CDATA[' + msg.event + ']]></Event>',
      '<EventKey><![CDATA[' + (msg.eventKey || '') + ']]></EventKey>'
    ].join('');
  } else if (msg.msgType === 'location') {
    xml += [
      '<Location_X>' + msg.locationX + '</Location_X>',
      '<Location_Y>' + msg.locationY + '</Location_Y>',
      '<Scale>' + msg.scale + '</Scale>',
      '<Label><![CDATA[' + msg.label + ']]></Label>'
    ].join('');
  } else if (msg.msgType === 'music') {
    xml += [
      '<Music>',
      '<Title><![CDATA[' + msg.music.title + ']]></Title>',
      '<Description><![CDATA[' + msg.music.description + ']]></Description>',
      '<MusicUrl><![CDATA[' + msg.music.musicUrl + ']]></MusicUrl>',
      '<HQMusicUrl><![CDATA[' + msg.music.hqMusicUrl + ']]></HQMusicUrl>',
      '</Music>'
    ].join('');
  } else if (msg.msgType === 'news') {
    var maxCount = 10,
      count = Math.min(msg.articles.length, maxCount);
    xml += '<ArticleCount>' + count + '</ArticleCount>';
    xml += '<Articles>';
    xml += _.reduce(msg.articles, function (memo, item) {
      return memo + [
        '<item>',
        '<Title><![CDATA[' + item.title + ']]></Title>',
        '<Description><![CDATA[' + item.description + ']]></Description>',
        '<PicUrl><![CDATA[' + item.picUrl + ']]></PicUrl>',
        '<Url><![CDATA[' + item.url + ']]></Url>',
        '</item>'
      ].join('');
    }, '');
    xml += '</Articles>';
  }
  xml += '</xml>';
  callback(null, xml);
}
WxParser.prototype.toMsg = function (xml, callback) {
  var error = new Error('Invalid WxXml');
  if (!xml) return callback(error);
  xml2js.parseString(xml, function (err, result) {
    if (err) return callback(error);
    var info = result.xml,
      msg = {
        toUserName: info.ToUserName[0],
        fromUserName: info.FromUserName[0],
        createTime: parseInt(info.CreateTime[0]),
        msgType: info.MsgType[0]
      }
    if (info.MsgId) {
      msg.msgId = parseInt(info.MsgId[0]);
    }
    if (info.FuncFlag) {
      msg.funcFlag = parseInt(info.FuncFlag[0]);
    }
    if (msg.msgType === 'text') {
      msg.content = info.Content[0];
    } else if (msg.msgType === 'image') {
      msg.picUrl = info.PicUrl[0];
    } else if (msg.msgType === 'voice') {
      msg.mediaId = info.MediaId[0];
      msg.format = info.Format[0];
      msg.recognition = info.Recognition[0];
    } else if (msg.msgType === 'link') {
      msg.title = info.Title[0];
      msg.description = info.Description[0];
      msg.url = info.Url[0];
    } else if (msg.msgType === 'event') {
      msg.event = info.Event[0];
      msg.eventKey = info.EventKey && info.EventKey[0];
    } else if (msg.msgType === 'location') {
      msg.locationX = info.Location_X[0];
      msg.locationY = info.Location_Y[0];
      msg.scale = info.Scale[0];
      msg.label = info.Label[0];
    } else if (msg.msgType === 'music') {
      var music = info.Music[0];
      msg.music = {
        title: music.Title[0],
        description: music.Description[0],
        musicUrl: music.MusicUrl[0],
        hqMusicUrl: music.HQMusicUrl[0]
      }
    } else if (msg.msgType === 'news') {
      var articles = info.Articles.item;
      msg.articles = _.reduce(articles, function (memo, item) {
        memo.push({
          title: item.Title[0],
          description: gitem.Description[0],
          picUrl: item.PicUrl[0],
          url: item.Url[0]
        });
        return memo;
      }, []);
    }
    callback(null, msg);
  });
}
