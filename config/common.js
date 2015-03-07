var path = require('path'),
  _ = require('underscore'),
  rootDir = path.resolve(__dirname, '..'),
  contentDir = path.join(rootDir, 'content'),
  host = '120.24.77.213',
  siteUrl = 'http://' + host + '/',
  snbarUrl = siteUrl + 'snbar/',
  songListUrl = snbarUrl + '#songlist',
  songDownUrl = siteUrl + 'song/down/',
  assetsUrl = siteUrl + 'assets/',
  package = require('../package.json');

module.exports = {
  host: host,
  wxPath: '/wx',
  secret: '' + Math.random(),
  dirs: {
    root: rootDir,
    public: publicDir = path.join(rootDir, 'public'),
    content: contentDir,
    tmp: path.join(contentDir, 'tmp'),
    presongs: path.join(contentDir, 'presongs'),
    songs: path.join(contentDir, 'songs'),
    assets: path.join(contentDir, 'assets')
  },
  urls: {
    site: siteUrl,
    songList: songListUrl,
    songDown: songDownUrl,
    logo: assetsUrl + 'logo.png'
  },
  wx: {
    validGet: true,
    validPost: false,
    loginAccount: true,
    voiceFormat: 'mp3',
    minSeconds: 20,
    maxNameLength: 16,
    token: 'whahax',
    account: require('../private/wx-account')	// private
  },
  meta: _.extend(package['meta'], {
    version: package['version']
  })
}
