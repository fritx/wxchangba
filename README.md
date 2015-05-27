# 微信唱吧 `wxchangba`

- 历史仓库: <https://github.com/fritx/wyu-sing>
- 0.1.x版本: <https://github.com/fritx/wxchangba/tree/0.1.x>

在线演示: <http://changba.wx.fritx.me>

## 搭建指南

- 下载安装[nodejs](http://nodejs.org)
- 通过npm安装gulp/bower
- 下载源码到本地, 或直接从git克隆
- 进入目录, 安装npm/bower依赖
- 复制并自定义配置文件
- 执行构建任务
- 以特定环境运行, 如dev/test/production, 默认dev

```
$ npm install --global gulp bower
$ git clone git@github.com:fritx/wxchangba.git
$ cd wxchangba
$ npm install && bower install
$ cp -r config-demo config
$ vim config/dev.js
$ gulp build
$ NODE_ENV=dev node .
```

## 效果图

### 手机屏幕

<img width="150" src="pic/songlist-phone-0.png">&nbsp;&nbsp;&nbsp;
<img width="150" src="pic/songlist-phone-1.png">&nbsp;&nbsp;&nbsp;
<img width="150" src="pic/song-phone-0.png">&nbsp;&nbsp;&nbsp;
<img width="150" src="pic/song-phone-1.png">

### 平板屏幕

<img width="240" src="pic/songlist-tablet-0.png">&nbsp;&nbsp;&nbsp;
<img width="240" src="pic/songlist-tablet-1.png">

<img width="240" src="pic/song-tablet-0.png">&nbsp;&nbsp;&nbsp;
<img width="240" src="pic/song-tablet-1.png">

### 歌单播放 / 微信内网页录音

<img width="150" src="pic/playlist-0.png">&nbsp;&nbsp;&nbsp;
<img width="150" src="pic/playlist-1.png">&nbsp;&nbsp;&nbsp;
<img width="150" src="pic/wx-record-0.png">&nbsp;&nbsp;&nbsp;
<img width="150" src="pic/wx-record-1.png">

### 管理平台

<img width="240" src="pic/admin-songlist-0.png">&nbsp;&nbsp;&nbsp;
<img width="240" src="pic/admin-songlist-1.png">

## 设计图

### 用例图

<img width="440" src="pic/用例图-详细.png">

### 时序图-微信公众号语音

<img width="500" src="pic/时序图-公众号语音.png">

### 时序图-微信内网页录音

<img width="560" src="pic/时序图-网页录音-详细.png">

### 时序图-微信网页接口授权

<img width="560" src="pic/时序图-微信网页接口授权.png">
