'use strict';


class ErrorMessage extends React.Component {
  render() {
    return (
      <div className="alert alert-danger alert-dismissible fade in" role="alert">
        <button type="button" className="close"
          aria-label="Close" data-dismiss="alert"
          ><span aria-hidden="true">&times;</span></button>
        {this.props.text}
      </div>
    );
  }
}


class ErrorBox extends React.Component {
  constructor(props) {
    super(props);
    this.messageList = [];
    this.nextId = 1;
    this.state = {messageList: this.messageList.slice()};
  }
  render() {
    return (
      <div id="errors">
        {this.state.messageList.map((msg) =>
          <ErrorMessage
            key={msg.id}
            id={msg.id}
            text={msg.text}
            />
        )}
      </div>
    );
  }
  report(text) {
    this.messageList.push({id: (this.nextId ++), text: text});
    this.setState({messageList: this.messageList});
  }
}
