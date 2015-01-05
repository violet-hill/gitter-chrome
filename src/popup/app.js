chrome.runtime.getBackgroundPage(function(background) {
  if(!(background && background.client)) return;
  var client = background.client,
    bodyTag = document.getElementsByTagName("body")[0],
    htmlTag = document.getElementsByTagName('html')[0];

  client.setUpdate(function() {
    React.render(React.createElement(Summary, { client: client }), bodyTag);
    var activeRoomCount = client.getActiveRooms().length,
      // 145 - height of pane
      // 45 - height of navbar
      height = Math.max(2, activeRoomCount) * 145 + 45;
    htmlTag.style.height = height + "px";
  });
});
