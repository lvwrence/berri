/** @jsx React.DOM */

// main component
var Berri = React.createClass({
  getInitialState: function() {
    return {user: null, ip: null, messages: []};
  },
  componentDidMount: function() {
    // initialization
    socket.on("initialize", this.initialize);
    // on receiving a message from the server
    socket.on("message", this.getMessage);
  },
  initialize: function(data) {
    console.log(data);
    this.setState({
      user: data.username,
      ip: data.ip,
      messages: data.messages
    });
  },
  getMessage: function(message) {
    this.setState({messages: this.state.messages.concat([message])});
  },
  render: function() {
    return (
      <div>
        <Conversation messages={this.state.messages} />
        <MessageInput user={this.state.user} />
      </div>
    );
  }
});

// conversation pane
var Conversation = React.createClass({
  render: function() {
    var renderMessage = function(message) {
      return <Message author={message.author} text={message.text} />
    };
    return (<ul>{this.props.messages.map(renderMessage)}</ul>);
  }
});

var Message = React.createClass({
  render: function() {
    return (<li>{this.props.author}: {this.props.text}</li>);
  }
});

var MessageInput = React.createClass({
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
      <form onSubmit={this.handleSubmit}>
        <input onChange={this.messageUpdated} value={this.state.text} />
      </form>
    );
  }
});

var socket = io.connect(window.location.hostname);
React.renderComponent(<Berri />, document.body);
