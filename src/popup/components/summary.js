var Room = React.createClass({
  openRoom: function(e) {
    if(e.target.tagName != "A") chrome.tabs.create({ url: this.props.room.url });
  },
  render: function() {
    var messages = this.props.room.stat.messages.join(" ");
    var user = this.props.room.stat.user;

    return (
      <li className="table-view-cell media">
        <div className="navigate-right room-card" onClick={this.openRoom}>
          <a className="user" href={user.url} target="_blank">
            <img className="user-avatar" src={user.avatar}/>
            <span className="user-name">{user.name}</span>
          </a>
          <div className="media-body messages" dangerouslySetInnerHTML={{__html: messages}} />
        </div>
      </li>
    );
  }
});

var Summary = React.createClass({
  render: function() {
    var children = _.reduce(this.props.rooms, function(result, room) {
      if(!room.isEmpty()) result.push(<Room key={room.id} room={room}/>);
      return result;
    }, []);

    return (
      <div className="content">
        <ul className="table-view">{children}</ul>
      </div>
    );
  }
});

chrome.runtime.getBackgroundPage(function(background) {
  if(!(background && background.client)) return;
  var client = background.client, bodyTag = document.getElementsByTagName("body")[0];

  client.setUpdate(function(rooms) {
    React.render(<Summary rooms={rooms} />, bodyTag);
  });
});
