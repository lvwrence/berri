/** @jsx React.DOM */

// main component
var Berri = React.createClass({
  getInitialState: function() {
    return {user: null, users: [], ip: null, messages: []};
  },
  componentDidMount: function() {
    // initialization
    socket.on("initialize", this.initialize);
    // on receiving a message from the server
    socket.on("message", this.getMessage);
    // on another user joining
    socket.on("join", this.userJoined);
    // on another user quitting
    socket.on("quit", this.userQuit);
  },
  initialize: function(data) {
    this.setState({
      user: data.username,
      users: data.users.concat([data.username]),
      ip: data.ip,
      messages: data.messages
    });
    scrollChatToBottom();
  },
  getMessage: function(message) {
    this.setState({messages: this.state.messages.concat([message])});
    scrollChatToBottom();
  },
  userJoined: function(user) {
    this.setState({users: this.state.users.concat([user])});
    scrollChatToBottom();
  },
  userQuit: function(user) {
    var newUsers = this.state.users.slice();
    newUsers.splice(newUsers.indexOf(user));
    this.setState({users:newUsers});
    scrollChatToBottom();
  },
  render: function() {
    return (
      <div id="chat">
        <UserList users={this.state.users} />
        <Conversation messages={this.state.messages} />
        <MessageInput user={this.state.user} />
      </div>
    );
  }
});

var UserList = React.createClass({
  render: function() {
    var renderUser = function(user) {
      return <li>{user}</li>
    }
    return <aside><ul>{this.props.users.map(renderUser)}</ul></aside>;
  }
});

// conversation pane
var Conversation = React.createClass({
  render: function() {
    var renderMessage = function(message) {
      return <Message author={message.author} text={message.text} />
    };
    return (<ul id="conversation">{this.props.messages.map(renderMessage)}</ul>);
  }
});

var Message = React.createClass({
  render: function() {
    var parsedMessage = this.props.author + ": " + URI.withinString(this.props.text, function(url) {
      return '<a href="' + url + '">' + url + "</a>";
    });
    return (<li dangerouslySetInnerHTML={{__html: parsedMessage}} />);
  }
});

var MessageInput = React.createClass({
  getInitialState: function() {
    return {text: ""};
  },
  messageUpdated: function(e) {
    this.setState({text: e.target.value});
  },
  handleEnter: function(e) {
    if (e.charCode == 13 && !e.shiftKey) {
      e.preventDefault();
      var message = { author: this.props.user, text: this.state.text };
      socket.emit("message", message);
      this.setState({text: ""});
    }
  },
  render: function() {
        return (
        <textarea placeholder="Write message..." value={this.state.text}
                  onChange={this.messageUpdated} onKeyPress={this.handleEnter}
                  className="animated"
        />
    );
  }
});

function scrollChatToBottom() {
  var objDiv = document.getElementById("chat");
  objDiv.scrollTop = objDiv.scrollHeight;
}

var socket = io.connect(window.location.hostname);
React.renderComponent(<Berri />, document.body);
