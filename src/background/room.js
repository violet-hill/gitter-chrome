var Room = function(info, messages) {
  this.buffer = messages;
  _.extend(this, _.pick(info, 'id', 'name', 'topic', 'userCount', 'unreadItems'));
  this.url = "https://gitter.im" + info.url;
  this.updateInfo();
}

_.tap(Room.prototype, function(proto) {
  proto.isEmpty = function() {
    return this.messages.length == 0;
  }

  proto.updateInfo = function() {
    this.user = {}, this.messages = [], this.updatedAt = null;

    if(this.buffer.length == 0) return;

    this.buffer = _.sortBy(this.buffer, function(message) { return -1 * new Date(message.sent).getTime(); });
    // leave only the last 10 messages in a buffer
    this.buffer = _.first(this.buffer, 10);

    var headMessage = _.head(this.buffer);
    this.user.id = headMessage.fromUser.id;
    this.user.name = headMessage.fromUser.displayName;
    this.user.nickname = headMessage.fromUser.username;
    this.user.url = "https://github.com" + headMessage.fromUser.url;
    this.user.avatar = headMessage.fromUser.avatarUrlSmall;

    this.messages.push(headMessage.html);
    _(this.buffer).tail().each(function(message) {
      if(message.fromUser.id != this.user.id) return false;
      // compose last 3 messages
      if(this.messages.length > 2) return false;
      // deleted messages
      if(message.html !== "") this.messages.push(message.html);
    }.bind(this));

    this.messages.reverse();
    this.updatedAt = new Date(headMessage.sent);
  }

  proto.updateMessages = function(message, operation) {
    if(operation == "update") {
      var i = _.pluck(this.buffer, 'id').indexOf(message.id);
      if(i == -1) return;
      this.buffer.splice(i, 1, message);
    } else if(operation == "create") {
      this.buffer.splice(0, 0, message);
    }
    this.updateInfo()
  }

  proto.isOlderThan = function(otherRoom) {
    var other = otherRoom.updatedAt;
    if(this.updatedAt && other) return this.updatedAt.getTime() < other.getTime();
  }
});


