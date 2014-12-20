var ChatSummary = React.createClass({
  render: function() {
    return (
      <li className="table-view-cell media">
        <a className="navigate-right" href="#">
          <img className="media-object pull-left" src={this.props.user.avatarUrlSmall}/>
          <div className="media-body">
            {this.props.user.displayName}
            <p>{this.props.message.text}</p>
          </div>
        </a>
      </li>
    );
  }
});

var ChatSummaryList = React.createClass({
  render: function() {
    var children = this.props.chatSummaries.map(function(chatSummary) {
      return (<ChatSummary key={chatSummary.id} message={chatSummary} user={chatSummary.fromUser}/>);
    });

    return (
      <div className="content">
        <ul className="table-view">{children}</ul>
      </div>
    );
  }
});

chrome.runtime.getBackgroundPage(function(background) {
  var client = background.client, bodyTag = document.getElementsByTagName("body")[0];

  client.onRoomUpdates(function(messages) {
    React.render(<ChatSummaryList chatSummaries={messages} />, bodyTag);
  });
});
