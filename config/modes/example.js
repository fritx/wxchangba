var path = require('path'),
  _ = require('underscore'),
  rootDir = path.resolve(__dirname, '../..'),
  contentDir = path.join(rootDir, 'content'),
  port = 3099,
  host = 'localhost',
  siteUrl = 'http://' + host + ':' + port,
  songListUrl = siteUrl + '/#songlist',
  songDownUrl = siteUrl + '/song/down/',
  assetsUrl = siteUrl + '/assets/',
  package = require('../../package.json');

module.exports = {
  port: port,
  host: host,
  secret: '' + Math.random(),
  mongo: {
    host: 'localhost',
    port: 27017,
    //user: {
    //  username: '',
    //  password: ''
    //},
    dbname: 'etips-www'
  },
  dirs: {
    root: rootDir,
    public: publicDir = path.join(rootDir, 'public'),
    content: contentDir,
    //tmp: path.join(contentDir, 'tmp'),
    //presongs: path.join(contentDir, 'presongs'),
    songs: path.join(contentDir, 'songs'),
    assets: path.join(contentDir, 'assets')
  },
  urls: {
    site: siteUrl,
    songList: songListUrl,
    songDown: songDownUrl,
    banner: assetsUrl + 'banner.png'
  },
  wx: {
    path: '/wx',
    validGet: true,
    validPost: false,
    loginAccount: true,
    voiceFormat: 'mp3',
    minSeconds: 20,
    maxNameLength: 16,
    token: 'whahax',
    account: require('../../private/wx-account') // private
  },
  meta: {
    title: '一分钟歌声',
    year: package['year'],
    version: package['version']
  }
}
