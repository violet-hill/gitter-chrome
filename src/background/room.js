var Room = function(info, messages) {
  this.messages = _.sortBy(messages, function(message) {
    return -1 * new Date(message.sent).getTime();
  });
  _.extend(this, _.pick(info, 'id', 'name', 'userCount', 'unreadItems'));
  this.topic = info.topic ? (info.name + " - " + info.topic) : info.name;
  this.url = "https://gitter.im" + info.url;
  this.updateStat();
}

Room.prototype.isEmpty = function() {
  return this.messages.length == 0;
}

Room.prototype.updateStat = function() {
  var stat = this.stat = { user: {}, messages: [], time: null };

  if(_.isEmpty(this.messages)) return;

  var headMessage = _.head(this.messages);
  stat.user.id = headMessage.fromUser.id;
  stat.user.name = headMessage.fromUser.displayName;
  stat.user.nickname = headMessage.fromUser.username;
  stat.user.url = "https://github.com" + headMessage.fromUser.url;
  stat.user.avatar = headMessage.fromUser.avatarUrlSmall;
  stat.messages.push(headMessage.html);
  _(this.messages).tail().each(function(message) {
    if(message.fromUser.id != stat.user.id) return false;
    // compose last 3 messages
    if(stat.messages.length > 2) return false;
    // deleted messages
    if(message.html !== "") stat.messages.push(message.html);
  });
  stat.messages.reverse();
  stat.time = new Date(headMessage.sent);
}
