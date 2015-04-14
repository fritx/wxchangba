# 邑大唱吧(一分钟歌声) `1min`

- 历史仓库：<https://github.com/fritx/wyu-sing>
- 在线演示：<http://1min.fritx.me>

## 效果图

<img width="170" src="screenshots/Screenshot_2014-03-26-20-12-22.jpeg">
&nbsp;
<img width="170" src="screenshots/Screenshot_2014-03-26-20-12-29.jpeg">
&nbsp;
<img width="170" src="screenshots/Screenshot_2014-03-26-20-12-44.jpeg">
&nbsp;
<img width="170" src="screenshots/Screenshot_2014-03-26-20-12-53.jpeg">

<img width="170" src="screenshots/Screenshot_2014-03-26-20-13-03.jpeg">
&nbsp;
<img width="170" src="screenshots/Screenshot_2014-03-26-20-13-22.jpeg">
&nbsp;
<img width="170" src="screenshots/Screenshot_2014-03-26-20-14-11.jpeg">

## 搭建指南

1. 安装并运行[mongodb](http://mongodb.com)
2. 安装[nodejs](http://nodejs.org)
3. 下载源码到本地，或直接从git克隆
4. 进入目录，安装nodejs依赖
5. 拷贝配置文件

```
$ git clone git@github.com:fritx/1min.git   # 克隆项目
$ cd 1min   # 进入目录
$ npm install   # 安装依赖
$ cp -r private.example private   # 拷贝private
$ cp config/modes/example.js config/modes/mode1.js   # 拷贝mode，不限
```

5. 自定义配置文件
6. 运行服务

```
$ vim private/admin-accounts.js   # 编辑管理员账号
$ vim private/wx-account.js   # 编辑微信公众号
$ vim config/modes/mode1.js   # 编辑运行模式
$ node app mode1   # 以mode1模式运行，默认example模式
```
