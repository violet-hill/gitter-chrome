var ChatHistory = function(room) {
  var messages = [];

  this.change = function(newMessages, action) {
    messages.push.apply(messages, newMessages);
  }

  this.head = function() {
    return messages[messages.length - 1];
  }
}
