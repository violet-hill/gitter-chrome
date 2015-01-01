GitterClient = function(token) {
  var apiClient = this.apiClient = new ApiClient(token);
  this.rooms = [];

  apiClient.getRooms().then(function(rooms) {
    var promises = _.map(rooms, function(room) {
      return this.addRoom(room);
    }.bind(this));

    Q.all(promises).then(function() {
      this.triggerUpdate();
    }.bind(this));
  }.bind(this));

  apiClient.getMe().then(function(user) {
    this.user = user;
    apiClient.subRooms(user.id, function(room, operation) {
      if(operation == "create") {
        this.addRoom(room).then(function() {
          this.triggerUpdate();
        }.bind(this));
      } else if(operation == "remove") {
        this.removeRoom(room);
      }

    }.bind(this));
  }.bind(this));
}

_.tap(GitterClient.prototype, function(proto) {
  proto.addRoom = function(info) {
    var promise = this.apiClient.getRecentMessages(info.id);
    return promise.then(function(messages) {
      var room = new Room(info, messages);

      this.apiClient.subMessages(room.id, function(message, operation) {
        room.updateMessages(message, operation);
        this.triggerUpdate();
      }.bind(this));

      this.rooms.push(room);
    }.bind(this));
  }

  proto.removeRoom = function(room) {
    var i = _.findIndex(this.rooms, function(candidate) { return candidate.id == room.id; });
    this.apiClient.unsubMessages(room.id);
    this.rooms.splice(i, 1);
    this.triggerUpdate();
  }

  proto.onRoomEvent = function(room, event, data) {}
  proto.onUpdate = _.noop;
  proto.triggerUpdate = function() {
    this.rooms.sort(function(a, b) { return a.isOlderThan(b) ? 1 : -1; });
    this.onUpdate(this.rooms, this.user);
  }
  proto.setUpdate = function(callback) {
    this.onUpdate = callback;
    this.triggerUpdate();
  }
});

window.client = new GitterClient(secret.token);
