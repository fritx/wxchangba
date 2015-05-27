var low = require('lowdb')
var config = require('../../config')
var db = module.exports = low(config.dbfile, {
  autosave: false,
  async: true
})
