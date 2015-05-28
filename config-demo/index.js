var env = process.env.NODE_ENV || 'dev'
process.env.NODE_ENV = env
console.log('config env:', env)
module.exports = require('./' + env) // 忽略注入攻击
