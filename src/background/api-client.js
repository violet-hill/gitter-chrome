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

    xhr.open("GET", "https://api.gitter.im/v1/" + path);
    xhr.setRequestHeader("Accept", "application/json")
    xhr.setRequestHeader("Authorization", "Bearer " + this.token);
    xhr.send();

    return deferred.promise;
  }

  proto.getMe = function() {
    return this.get("user").then(function(data) { return data[0]; });
  }

  proto.getRooms = function() {
    return this.get("rooms");
  }

  proto.getRecentMessages = function(roomId) {
    return this.get("rooms/" + roomId + "/chatMessages?limit=10");
  }

  proto.sub = function(path, callback) {
    this.faye.subscribe("/api/v1/" + path, function(message) {
      callback(message.model, message.operation);
    }, {});
  }

  proto.subMessages = function(roomId, callback) {
    this.sub("rooms/" + roomId + "/chatMessages", callback);
  }

  proto.subRooms = function(userId, callback) {
    this.sub("user/" + userId + "/rooms", callback);
  }
});;
