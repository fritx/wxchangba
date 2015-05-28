var express = require('express')
var morgan = require('morgan')
var favicon = require('serve-favicon')
var compression = require('compression')
var cache = require('./lib/cache')
var path = require('path')
var config = require('../../config')
var app = module.exports = express()
var rootpath = path.resolve(__dirname, '../../')
var session = require('express-session')
var _ = require('lodash')

app.set('env', config.env)
app.enable('trust proxy')
app.use(morgan('dev'))
app.use(compression())

app.use(session({
  secret: ''+Math.random(),
  resave: false,
  saveUninitialized: false // 惰性session
}))

app.use('/', favicon(
  path.join(rootpath, 'static/favicon.ico'), {
    maxAge: config.staticache*6e3 // min => ms
  }
))
app.use('/static', cache(config.staticcache), express.static(
  path.resolve(__dirname, '../../static')
))
app.use('/media', cache(config.staticcache), express.static(
  config.mediadir
))

require('./api')(app)
require('./view')(app)
require('./wxapp')(app)
