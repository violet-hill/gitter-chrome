chrome.storage.local.get(function(config) {
  window.client = new GitterClient(config.token);

  window.addEventListener("offline", function() {
    client.toOffline();
  });

  window.addEventListener("online", function() {
    // after wake up on mac `online` event will triggered
    // but there will no be connection
    setTimeout(client.toOnline, 2000);
  });
});
