var ZoneDate = module.exports = function (zone) {    // eg. 北京: 8
  this.offset = new Date().getTimezoneOffset();
  this.zone = zone;
}

ZoneDate.prototype.getDate = function () {
  var theOffset = -this.zone * 60,
    diff = (this.offset - theOffset) * 60 * 1000;
  return new Date(new Date().getTime() + diff);
}
