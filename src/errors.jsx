'use strict';


var ErrorMessage = React.createClass({
  render: function() {
    return (
      <div className="alert alert-danger alert-dismissible fade in" role="alert">
        <button type="button" className="close"
          aria-label="Close" data-dismiss="alert"
          ><span aria-hidden="true">&times;</span></button>
        {this.props.text}
      </div>
    );
  },
});


var ErrorBox = React.createClass({
  render: function() {
    return (
      <div>
        {this.state.messageList.map((msg) =>
          <ErrorMessage
            key={msg.id}
            id={msg.id}
            text={msg.text}
            />
        )}
      </div>
    );
  },
  getInitialState: function() {
    this.messageList = [];
    this.nextId = 1;
    return {messageList: this.messageList.slice()};
  },
  report: function(text) {
    this.messageList.push({id: (this.nextId ++), text: text});
    this.setState({messageList: this.messageList});
  },
});
