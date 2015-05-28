var env = process.env.NODE_ENV || 'dev'
process.env.NODE_ENV = env
console.log('config env:', env)
var _ = require('lodash')

var defaults = require('./defaults')
var patch = require('./' + env) // 忽略注入攻击
module.exports = _.defaults(patch, defaults)
