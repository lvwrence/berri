/** @jsx React.DOM */

// main component
var Berri = React.createClass({displayName: 'Berri',
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
    console.log(data);
    this.setState({
      user: data.username,
      users: data.users,
      ip: data.ip,
      messages: data.messages
    });
  },
  getMessage: function(message) {
    this.setState({messages: this.state.messages.concat([message])});
  },
  userJoined: function(user) {
    this.setState({users: this.state.users.concat([user])});
  },
  userQuit: function(user) {
    var newUsers = this.state.users.slice();
    newUsers.splice(newUsers.indexOf(user));
    this.setState({users:newUsers});
  },
  render: function() {
    return (
      React.DOM.div(null, 
        UserList({users: this.state.users}), 
        Conversation({messages: this.state.messages}), 
        MessageInput({user: this.state.user})
      )
    );
  }
});

var UserList = React.createClass({displayName: 'UserList',
  render: function() {
    var renderUser = function(user) {
      return React.DOM.li(null, user)
    }
    return React.DOM.ul(null, this.props.users.map(renderUser));
  }
});

// conversation pane
var Conversation = React.createClass({displayName: 'Conversation',
  render: function() {
    var renderMessage = function(message) {
      return Message({author: message.author, text: message.text})
    };
    return (React.DOM.ul(null, this.props.messages.map(renderMessage)));
  }
});

var Message = React.createClass({displayName: 'Message',
  render: function() {
    return (React.DOM.li(null, this.props.author, ": ", this.props.text));
  }
});

var MessageInput = React.createClass({displayName: 'MessageInput',
  getInitialState: function() {
    return {text: ""};
  },
  messageUpdated: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var message = { author: this.props.user, text: this.state.text };
    socket.emit("message", message);
    this.setState({text: ""});
  },
  render: function() {
    return (
      React.DOM.form({onSubmit: this.handleSubmit}, 
        React.DOM.input({onChange: this.messageUpdated, value: this.state.text})
      )
    );
  }
});

var socket = io.connect(window.location.hostname);
React.renderComponent(Berri(null), document.body);
