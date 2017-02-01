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
    len = Math.min(len, 60) // 不应该显示成超过60″
    song.lengthstr = len + '″'
  }

  if (!song.localfile) song.localfile = song.mediaid + '.mp3'
  song.filepath = 'media/' + song.localfile
  if (!song.title) {
    song.title = song._title || '歌曲 ' + song.mediaid
  }
  if (!song.author) song.author = config.defaultauthor
}
