'use strict';

class NewFileModal extends React.Component {
  constructor (props) {
    super(props);
    this.state = {error: false, help: false};
  }
  render() {
    var mdUrl = 'https://help.github.com/articles/markdown-basics/';
    return (
      <form className="modal-content" onSubmit={this.handleSubmit.bind(this)}>
        <div className="modal-header">
          <button type="button" className="close"
                  data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">New file</h4>
        </div>
        <div className="modal-body">
          <div className={'form-group' + (this.state.error ? ' has-error' : '' )}>
            <input className="form-control" placeholder="path" ref="path" />
            <span className="help-block">
              Filename must end with <code>.md</code> or <code>.html</code> (
              <a className="buttonlink"
                  onClick={() => this.setState({help: true})}
                  >why?</a>)
            </span>
          </div>
          {this.state.help ?
            <div>
              <p>
                <code>.md</code> is for <a href={mdUrl}
                target="_blank">Markdown</a>, a powerful wiki-like format that
                gets compiled to HTML. You can edit the source code and get a
                preview underneath. <code>.html</code> is for plain HTML files.
                You can edit the content in a friendly visual editor. Choose
                whichever you like.
              </p>
            </div>
          : null}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-default"
                  data-dismiss="modal">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    );
  }
  componentDidMount() {
    setTimeout(() => React.findDOMNode(this.refs.path).focus(), 500);
  }
  handleSubmit(evt) {
    evt.preventDefault();
    var path = React.findDOMNode(this.refs.path).value.trim();
    if(path.match(/\.(md|markdown|html)$/)) {
      app.hideModal();
      this.props.onCreate(path);
    }
    else {
      this.setState({error: true});
    }
  }
}
