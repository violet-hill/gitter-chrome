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

GitterClient.prototype.addRoom = function(room) {
  var promise = this.apiClient.getRecentMessages(room.id);
  return promise.then(function(messages) {
    var item = new Room(room, messages);
    this.rooms.push(item);
  }.bind(this));
}

GitterClient.prototype.removeRoom = function(room) {
  var i = _.findIndex(this.rooms, function(candidate) { return candidate.id == room.id; });
  this.rooms.splice(i, 1);
  this.triggerUpdate();
}

GitterClient.prototype.onRoomEvent = function(room, event, data) {}
GitterClient.prototype.onUpdate = _.noop;
GitterClient.prototype.triggerUpdate = function() { this.onUpdate(this.rooms); }
GitterClient.prototype.setUpdate = function(callback) {
  this.onUpdate = callback;
  this.triggerUpdate();
}

window.client = new GitterClient(secret.token);
