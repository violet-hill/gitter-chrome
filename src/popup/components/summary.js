var Room = React.createClass({
  dateToString: function(date) {
    if(date)
      return "" + date.getFullYear() + "-" +
        this.formatDate(date.getMonth() + 1) + "-" +
        this.formatDate(date.getDate()) + " " +
        this.formatDate(date.getHours()) + ":" + this.formatDate(date.getMinutes());
  },
  formatDate: function(val) {
    return (val < 10) ? ("0" + val) : val.toString();
  },
  getInitialState: function() {
    return { showTopic: false };
  },
  openRoom: function(e) {
    if(e.target.tagName != "A") chrome.tabs.create({ url: this.props.room.url });
  },
  toggleTopic: function(e) {
    e.preventDefault();
    this.setState({ showTopic: !this.state.showTopic });
  },
  render: function() {
    var room = this.props.room, user = room.user;
    var messages = _.map(room.messages, function(message) {
      return (<div className="message" dangerouslySetInnerHTML={{__html: message}} />);
    });

    var classes = {};
    if(this.state.showTopic) {
      if(room.topic != "") {
        classes.topic = "topic";
        classes.topicToggler = "icon icon-up-nav topic-toggler";
      } else {
        classes.topic = classes.topicToggler = "hide";
      }
    } else {
      classes.topic = "hide";
      classes.topicToggler = (room.topic != "") ? "icon icon-down-nav topic-toggler" : "hide";
    }

    return (
      <li className="table-view-cell media">
        <div className="navigate-right room-card">
          <a className="user" href={user.url} target="_blank">
            <img className="user-avatar" src={user.avatar}/>
            <span className="user-name">{user.name}</span>
          </a>
          <div className="media-body summary">
            <div className="info">
              <a className="room-name" href={room.url}>{room.name}</a>
              <span className="icon icon-person">{room.userCount}</span>
              <a className={classes.topicToggler} onClick={this.toggleTopic} href="#"></a>
              <label className={classes.topic}>{room.topic}</label>
            </div>

            <div className="messages" onClick={this.openRoom}>{messages}</div>

            <div className="footer">
              <label className="updated-at">{this.dateToString(room.updatedAt)}</label>
            </div>
          </div>
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
        <div className="bar bar-nav about">
          <a className="icon icon-code pull-left" href="https://github.com/violet-hill" target="_blank">
            <span className="brand">Made by Violet Hill</span>
          </a>
          <a className="icon icon-close pull-right" href="#"></a>
          <h1 className="title">{this.props.user.displayName}</h1>
        </div>
        <ul className="table-view room-cards">{children}</ul>
      </div>
    );
  }
});

chrome.runtime.getBackgroundPage(function(background) {
  if(!(background && background.client)) return;
  var client = background.client, bodyTag = document.getElementsByTagName("body")[0];

  client.setUpdate(function(rooms, user) {
    React.render(<Summary rooms={rooms} user={user} />, bodyTag);
  });
});
