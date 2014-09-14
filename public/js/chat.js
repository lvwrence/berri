/** @jsx React.DOM */

// main component
var Berri = React.createClass({displayName: 'Berri',
  getInitialState: function() {
    return {
      gettingUsername: true,
      username: null,
      users: [],
      ip: null,
      messages: []
    };
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
      users: data.users,
      ip: data.ip,
      messages: data.messages
    });
    scrollChatToBottom();
  },
  usernameWasSet: function(username) {
    this.setState({username: username, gettingUsername: false});
    document.getElementById("message-input").focus();
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
      React.DOM.div(null, 
        UsernameModal({active: this.state.gettingUsername, 
                       usernameWasSet: this.usernameWasSet}
        ), 
        React.DOM.div({id: "chat"}, 
          UserList({users: this.state.users}), 
          Conversation({messages: this.state.messages}), 
          MessageInput({username: this.state.username})
        )
      )
    );
  }
});

var UsernameModal = React.createClass({displayName: 'UsernameModal',
  componentDidMount: function() {
    document.getElementById("username-input").focus();
  },
  getInitialState: function() {
    return {tentativeUsername: ''}
  },
  handleTyping: function(e) {
    this.setState({tentativeUsername: e.target.value});
  },
  handleSubmit: function(e) {
    if (e.charCode == 13) {
      e.preventDefault();
      this.submitUsername();
      this.setState({text: ""});
    }
  },
  submitUsername: function() {
    console.log("emitting username...");
    var username = this.state.tentativeUsername;
    socket.emit("username", username);
    this.props.usernameWasSet(username);
  },
  render: function() {
    if (this.props.active) {
      return (
        React.DOM.div({className: "modal"}, 
          React.DOM.div({className: "modal-dialog"}, 
            React.DOM.div({className: "modal-content"}, 
              
              React.DOM.div({className: "modal-body"}, 
                React.DOM.h4(null, "Enter your username"), 
                React.DOM.input({type: "text", id: "username-input", 
                       className: "form-control", 
                       onChange: this.handleTyping, 
                       onKeyPress: this.handleSubmit}
                       )
              ), 

              React.DOM.div({className: "modal-footer"}, 
                React.DOM.a({onClick: this.submitUsername, className: "btn btn-primary btn-wide"}, "Enter room")
              )
            )
          )
        )
        );
    } else {
      return null;
    }
  }
});

var UserList = React.createClass({displayName: 'UserList',
  render: function() {
    var renderUser = function(user) {
      return React.DOM.li(null, user)
    }
    return React.DOM.aside(null, React.DOM.ul(null, this.props.users.map(renderUser)));
  }
});

// conversation pane
var Conversation = React.createClass({displayName: 'Conversation',
  render: function() {
    var renderMessage = function(message) {
      return Message({author: message.author, text: message.text})
    };
    return (React.DOM.ul({id: "conversation"}, this.props.messages.map(renderMessage)));
  }
});

var Message = React.createClass({displayName: 'Message',
  render: function() {
    var parsedMessage = this.props.author + ": " + URI.withinString(this.props.text, function(url) {
      return '<a href="' + url + '">' + url + "</a>";
    });
    return (React.DOM.li({dangerouslySetInnerHTML: {__html: parsedMessage}}));
  }
});

var MessageInput = React.createClass({displayName: 'MessageInput',
  getInitialState: function() {
    return {text: ""};
  },
  messageUpdated: function(e) {
    this.setState({text: e.target.value});
  },
  handleEnter: function(e) {
    if (e.charCode == 13 && !e.shiftKey) {
      e.preventDefault();
      var message = { author: this.props.username, text: this.state.text };
      socket.emit("message", message);
      this.setState({text: ""});
    }
  },
  render: function() {
        return (
        React.DOM.textarea({id: "message-input", 
                  placeholder: "Write message...", value: this.state.text, 
                  onChange: this.messageUpdated, onKeyPress: this.handleEnter, 
                  className: "animated"}
        )
    );
  }
});

function scrollChatToBottom() {
  var objDiv = document.getElementById("chat");
  objDiv.scrollTop = objDiv.scrollHeight;
}

var socket = io.connect(window.location.hostname);
React.renderComponent(Berri(null), document.body);
