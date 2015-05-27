// hhiiss
exports.tostr3 = function(_d){
  if (!_d || !_d.valueOf()) return ''
  var ymdhis = getymdhis(_d)
  return ymdhis[3] + '' + ymdhis[4] + '' + ymdhis[5]
}

// yyyymmdd_hhiiss
exports.tostr2 = function(_d){
  if (!_d || !_d.valueOf()) return ''
  var ymdhis = getymdhis(_d)
  return ymdhis[0] + '' + ymdhis[1] + '' + ymdhis[2] +
    '_' + ymdhis[3] + '' + ymdhis[4] + '' + ymdhis[5]
}

// yyyy-mm-dd
exports.tostr1 = function(_d){
  if (!_d || !_d.valueOf()) return ''
  var ymdhis = getymdhis(_d)
  return ymdhis[0] + '-' + ymdhis[1] + '-' + ymdhis[2]
}

// yyyy-mm-dd hh:ii:ss
exports.tostr = function(_d){
  if (!_d || !_d.valueOf()) return ''
  var ymdhis = getymdhis(_d)
  return ymdhis[0] + '-' + ymdhis[1] + '-' + ymdhis[2] +
    ' ' + ymdhis[3] + ':' + ymdhis[4] + ':' + ymdhis[5]
}

function getymdhis(_d){
  var d = new Date(_d)
  var year = d.getFullYear()
  var month = twobits(d.getMonth() + 1)
  var day = twobits(d.getDate())
  var hour = twobits(d.getHours())
  var minute = twobits(d.getMinutes())
  var second = twobits(d.getSeconds())
  return [
    year, month, day, hour, minute, second
  ]
}
function twobits(str){
  str = '' + str
  return str.length < 2 ? '0' + str : str
}
