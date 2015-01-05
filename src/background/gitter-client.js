GitterClient = function(token) {
  var apiClient = this.apiClient = new ApiClient(token);
  this.offline = false;
  this.getRooms();

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

  proto.getRooms = function() {
    this.rooms = [];

    return this.apiClient.getRooms().then(function(rooms) {
      var promises = _.map(rooms, function(room) {
        return this.addRoom(room);
      }.bind(this));

      return Q.all(promises).then(function() {
        this.triggerUpdate();
      }.bind(this));
    }.bind(this));
  }

  proto.getActiveRooms = function() {
    return _.reduce(this.rooms, function(result, room) {
      if(!room.isEmpty()) result.push(room);
      return result;
    }, []);
  }

  proto.removeRoom = function(room) {
    var i = _.findIndex(this.rooms, function(candidate) { return candidate.id == room.id; });
    this.apiClient.unsubMessages(room.id);
    this.rooms.splice(i, 1);
    this.triggerUpdate();
  }

  proto.onUpdate = _.noop;

  proto.toOnline = function() {
    this.offline = false;
    _.each(this.rooms, function(room) { this.apiClient.unsubMessages(room.id); }.bind(this));
    this.getRooms();
  }

  proto.toOffline = function() {
    this.offline = true;
    this.triggerUpdate();
  }

  proto.triggerUpdate = function() {
    this.rooms.sort(function(a, b) { return a.isOlderThan(b) ? 1 : -1; });
    this.onUpdate();
  }

  proto.setUpdate = function(callback) {
    this.onUpdate = callback;
    this.triggerUpdate();
  }
});
