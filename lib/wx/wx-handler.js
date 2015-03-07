var _ = require('underscore'),
  activityNames = ['root', 'submit'],
  activityHash = _.reduce(activityNames, function (memo, name) {
    var activity = new (require('./activities/' + name))();
    activity.name = name;
    memo[name] = activity;
    return memo;
  }, {}), db, userColl;

var WxHandler = module.exports = function (app) {
}

WxHandler.prototype.watch = function (app) {
  _.each(activityHash, function (activity) {
    activity.watch(app, activityHash);
  });
  userColl = app.get('userColl');
}

WxHandler.prototype.handle = function (req, res) {
  var reqMsg = req.wxMsg,
    username = reqMsg.fromUserName;

  // 用户基本信息
  userColl.findOne({
    username: username
  }, function (err, user) {
    if (!user) {   // 用户未曾存入
      user = {
        username: username,
        fakeid: 0,
        nickname: '',
        activity: 'root'
      }
      userColl.insert(user, function (err, docs) {
        console.info('New user added: ' + username); // 打印新增用户
      });
    }
    req.wxUser = user;
    var activityName = user.activity,
      activity = activityHash[activityName] || rootActivity;
    activity.act(req, res);
  });
}
