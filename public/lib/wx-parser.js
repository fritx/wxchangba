var WxParser = function () {
}

WxParser.prototype.toXml = function (msg) {
  if (!msg) return '';
  var xml = '<xml>';
  xml += [
    '<ToUserName><![CDATA[' + msg.toUserName + ']]></ToUserName>',
    '<FromUserName><![CDATA[' + msg.fromUserName + ']]></FromUserName>',
    '<CreateTime>' + msg.createTime + '</CreateTime>',
    '<MsgType><![CDATA[' + msg.msgType + ']]></MsgType>'
  ].join('');
  if (msg.msgId) {
    xml += '<MsgId>' + msg.msgId + '</MsgId>';
  }
  if (msg.msgType === 'text') {
    xml += [
      '<Content><![CDATA[' + msg.content + ']]></Content>'
    ].join('');
  } else if (msg.msgType === 'image') {
    xml += [
      '<PicUrl><![CDATA[' + msg.picUrl + ']]></PicUrl>'
    ].join('');
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
  } else if (msg.msgType === 'music') {
    xml += [
      '<Music>',
      '<Title><![CDATA[' + msg.music.title + ']]></Title>',
      '<Description><![CDATA[' + msg.music.description + ']]></Description>',
      '<MusicUrl><![CDATA[' + msg.music.musicUrl + ']]></MusicUrl>',
      '<HQMusicUrl><![CDATA[' + msg.music.hqMusicUrl + ']]></HQMusicUrl>',
      '</Music>'
    ].join('');
  } else if (msg.msgType === 'location') {
    xml += [
      '<Location_X>' + msg.locationX + '</Location_X>',
      '<Location_Y>' + msg.locationY + '</Location_Y>',
      '<Scale>' + msg.scale + '</Scale>',
      '<Label><![CDATA[' + msg.label + ']]></Label>'
    ].join('');
  } else if (msg.msgType === 'news') {
    var maxCount = 10,
      count = Math.min(msg.articles.length, maxCount);
    xml += '<ArticleCount>' + count + '</ArticleCount>';
    _.each(msg.articles, function (val) {
      xml += [
        '<Articles>',
        '<item>',
        '<Title><![CDATA[' + val.title + ']]></Title>',
        '<Description><![CDATA[' + val.description + ']]></Description>',
        '<PicUrl><![CDATA[' + val.picUrl + ']]></PicUrl>',
        '<Url><![CDATA[' + val.url + ']]></Url>',
        '</item>',
        '</Articles>'
      ].join('');
    });
  }
  xml += '</xml>';
  return xml;
}
WxParser.prototype.toMsg = function (xml) {
  if (!xml) return null;
  try {
    var $xml = $(xml),
      msg = {
        toUserName: getCData($xml.find('ToUserName').html()),
        fromUserName: getCData($xml.find('FromUserName').html()),
        createTime: parseInt($xml.find('CreateTime').html()),
        msgType: getCData($xml.find('MsgType').html())
      }
    if ($xml.find('MsgId').length) {
      msg.msgId = parseInt($xml.find('MsgId').html());
    }
    if (msg.msgType === 'text') {
      _.extend(msg, {
        content: getCData($xml.find('Content').html())
      });
    } else if (msg.msgType === 'image') {
      _.extend(msg, {
        picUrl: getCData($xml.find('PicUrl').html())
      });
    } else if (msg.msgType === 'voice') {
      _.extend(msg, {
        mediaId: getCData($xml.find('MediaId').html()),
        format: getCData($xml.find('Format').html()),
        recognition: getCData($xml.find('Recognition').html())
      });
    } else if (msg.msgType === 'link') {
      _.extend(msg, {
        title: getCData($xml.find('Title').html()),
        description: getCData($xml.find('Description').html()),
        url: getCData($xml.find('Url').html())
      });
    } else if (msg.msgType === 'event') {
      _.extend(msg, {
        event: getCData($xml.find('Event').html()),
        eventKey: getCData($xml.find('EventKey').html())
      });
    } else if (msg.msgType === 'music') {
      _.extend(msg, {
        music: {
          title: getCData($xml.find('Music Title').html()),
          description: getCData($xml.find('Music Description').html()),
          musicUrl: getCData($xml.find('Music MusicUrl').html()),
          hqMusicUrl: getCData($xml.find('Music HQMusicUrl').html())
        }
      });
    } else if (msg.msgType === 'location') {
      _.extend(msg, {
        locationX: Number($xml.find('Location_X').html()),
        locationY: Number($xml.find('Location_Y').html()),
        scale: Number($xml.find('Scale').html()),
        label: getCData($xml.find('Label').html())
      });
    } else if (msg.msgType === 'news') {
      _.extend(msg, {
        articles: (function () {
          var ret = [], $articles = $xml.find('Articles');
          $articles.children('item').each(function (i, el) {
            var $el = $(el);
            ret.push({
              title: getCData($el.find('Title').html()),
              description: getCData($el.find('Description').html()),
              picUrl: getCData($el.find('PicUrl').html()),
              url: getCData($el.find('Url').html())
            });
          });
          return ret;
        })()
      });
    }
    return msg;
  } catch (err) {
    return null;
  }
}

function getCData(str) {
  if (!str) return '';
  //return str.substring(11, str.length - 5);
  return str.match(/^\s*(<!\-\-|&lt;!)\[CDATA\[([\s\S]*)\]\](&gt;|\-\->)\s*$/)[2];
}

function getCData(str) {
  if (!str) return '';
  //return str.substring(11, str.length - 5);
  return str.match(/^\s*(<!\-\-|&lt;!)\[CDATA\[([\s\S]*)\]\](&gt;|\-\->)\s*$/)[2];
}
