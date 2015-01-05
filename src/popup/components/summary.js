var Summary = React.createClass({
  render: function() {
    var client = this.props.client, user = client.user,
      children = _.map(client.getActiveRooms(), function(room) {
        return (<Room key={room.id} room={room}/>);
      });

    return (
      <div className="content">
        <div className="bar bar-nav about">
          <span className="icon icon-code pull-left brand">
            Made by
            <a href="https://github.com/violet-hill">Violet Hill</a>
          </span>
          <a className="icon icon-close pull-right" href="#"></a>
          <h1 className="title">{user.displayName}</h1>
        </div>
        <ul className="table-view room-cards">{children}</ul>
      </div>
    );
  }
});
