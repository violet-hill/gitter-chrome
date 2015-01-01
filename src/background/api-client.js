ApiClient = function(token) {
  this.token = token;
  this.faye = new Faye.Client('https://ws.gitter.im/faye', { timeout: 60, retry: 5, interval: 1 });
  this.faye.addExtension({
    outgoing: function(message, callback) {
      if(!message.ext) { message.ext = {}; }
      message.ext.token = token;
      callback(message);
    }
  });
}


_.tap(ApiClient.prototype, function(proto) {
  proto.get = function(path, callback) {
    var xhr = new XMLHttpRequest(), deferred = Q.defer();

    xhr.onload = function() {
      var result = JSON.parse(xhr.responseText);
      result.$xhr = xhr;
      deferred.resolve(result);
    }

    xhr.open("GET", "https://api.gitter.im/v1" + path);
    xhr.setRequestHeader("Accept", "application/json")
    xhr.setRequestHeader("Authorization", "Bearer " + this.token);
    xhr.send();

    return deferred.promise;
  }

  var toP = function() {
    var args = Array.prototype.slice.call(arguments);
    args.splice(0, 0, '');
    return args.join('/');
  }

  proto.getMe = function() {
    return this.get("/user").then(function(data) { return data[0]; });
  }

  proto.getRooms = function() {
    return this.get("/rooms");
  }

  proto.getRecentMessages = function(roomId) {
    return this.get(toP("rooms", roomId, "chatMessages") + "?limit=10");
  }

  proto.sub = function(path, callback) {
    this.faye.subscribe(toP('api', 'v1') + path, function(message) {
      callback(message.model, message.operation);
    }, {});
  }

  proto.subMessages = function(roomId, callback) {
    this.sub(toP("rooms", roomId, "chatMessages"), callback);
  }

  proto.subRooms = function(userId, callback) {
    this.sub(toP("user", userId, "rooms"), callback);
  }

  proto.unsub = function(path) {
    this.faye.unsubscribe(toP('api', 'v1') + path);
  }

  proto.unsubMessages = function(roomId) {
    this.unsub(toP("rooms", roomId, "chatMessages"));
  }
});;
