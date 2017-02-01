var config = require('../../../config')
var datestr = require('./datestr')

module.exports = function fillsong(song){
  song.timestr = song.createtime || '-'
  song.timestr1 = datestr.tostr1(song.createtime) || '-'
  song.timestr2 = datestr.tostr2(song.createtime) || '-'

  var len = song.playlength
  if (len == null) {
    song.lengthstr = '-'
  } else {
    if (len === 61) len = 60 // 相当一部分都是61″ 显示为60″
    song.lengthstr = len + '″'
  }

  if (!song.localfile) song.localfile = song.mediaid + '.mp3'
  song.filepath = 'media/' + song.localfile
  if (!song.title) {
    song.title = song._title || '歌曲 ' + song.mediaid
  }
  if (!song.author) song.author = config.defaultauthor
}
