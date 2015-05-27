var env = process.env.NODE_ENV || 'dev'
process.env.NODE_ENV = env
module.exports = require('./' + env) // 忽略注入攻击
