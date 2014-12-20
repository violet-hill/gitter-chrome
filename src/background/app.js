var GitterClient = function(token) {
  this.token = token;
  var faye = this.faye = new Faye.Client('https://ws.gitter.im/faye', {timeout: 60, retry: 5, interval: 1});
  faye.addExtension({
    outgoing: function(message, callback) {
      if(!message.ext) { message.ext = {}; }
      message.ext.token = token;
      callback(message);
    }
  });
}

GitterClient.prototype.jsonRequest = function(path, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() { callback(xhr); }
  xhr.open("GET", "https://api.gitter.im/v1/" + path);
  xhr.setRequestHeader("Accept", "application/json")
  xhr.setRequestHeader("Authorization", "Bearer " + this.token);
  xhr.send();
}

GitterClient.prototype.getChatMessages = function(roomId, limit, callback) {
  var path = "rooms/" + roomId + "/chatMessages?limit=" + limit;
  this.jsonRequest(path, function(xhr) {
    var chatMessages = JSON.parse(xhr.responseText);
    callback(chatMessages);
  });
}

GitterClient.prototype.subscribe = function(roomId, callback) {
  var faye = this.faye;

  this.getChatMessages(roomId, 50, function(messages) {
    callback(messages, "init");

    faye.subscribe('/api/v1/rooms/' + roomId + '/chatMessages', function(response) {
      var operation = response.operation, message = response.model;
      if((operation == "update") && (message.text == "")) operation = "delete";
      callback([message], operation);
    }, {});
  });
}

GitterClient.prototype.onRoomUpdates = function(callback) {
  var client = this, histories = [];

  var handler = function() {
    var heads = [], i = 0, historyLength = histories.length;
    for(; i < historyLength; i++) {
      var head = histories[i].head();
      if(head) heads.push(head);
    }

    callback(heads);
  }

  this.jsonRequest("rooms", function(xhr) {
    var rooms = JSON.parse(xhr.responseText);

    _.each(rooms, function(room) {
      var history = new ChatHistory(room);

      client.subscribe(room.id, function(messages, action) {
        history.change(messages, action);
        handler();
      });

      histories.push(history);
    });

    handler();
  });
}

var client = new GitterClient(secret.token);
