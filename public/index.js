/** @jsx React.DOM */

// main component
var Berri = React.createClass({displayName: 'Berri',
  getInitialState: function() {
    return {user: null, messages: []};
  },
  componentDidMount: function() {
    // initialization
    socket.on("initialize", this.initialize);
    // on receiving a message from the server
    socket.on("message", this.getMessage);
  },
  initialize: function(data) {
    this.setState({user: data});
  },
  getMessage: function(message) {
    this.setState({messages: this.state.messages.concat([message])});
  },
  render: function() {
    return (
      React.DOM.div(null, 
        Conversation({messages: this.state.messages}), 
        MessageInput({user: this.state.user})
      )
    );
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
    var message = { author: this.props.user.username, text: this.state.text };
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
