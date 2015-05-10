'use strict';

class NewFileModal extends React.Component {
  constructor (props) {
    super(props);
    this.state = {error: null, help: false};
  }
  render() {
    var collectionSingular = this.props.collection.name.replace(/s$/, '');
    var mdUrl = 'https://help.github.com/articles/markdown-basics/';
    return (
      <form className="modal-content" onSubmit={this.handleSubmit.bind(this)}>
        <div className="modal-header">
          <button type="button" className="close"
                  data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">New {collectionSingular}</h4>
        </div>
        <div className="modal-body">
          <div className={'form-group' + (this.state.error ? ' has-error' : '' )}>
            <input
              className="form-control"
              placeholder="path"
              ref="path"
              defaultValue="new-page.md"
              onChange={this.updateUrl.bind(this)}
              />
            <span className="help-block">
              Filename must end with <code>.md</code> or <code>.html</code> (
              <a className="buttonlink"
                  onClick={() => this.setState({help: true})}
                  >why?</a>)
            </span>
            {this.state.error ?
              <span className="help-block">Error: {this.state.error}</span>
            : null}
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
          <p>
            Url: <code>{this.state.url}</code>
          </p>
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
    setTimeout(() => React.findDOMNode(this.refs.path).select(), 500);
    this.updateUrl();
  }
  pathHasError(path) {
    if(! path.match(/\.(md|markdown|html)$/)) {
      return "invalid file name";
    }

    if(this.props.pathExists(path)) {
      return "file already exists";
    }
  }
  updateUrl() {
    var path = React.findDOMNode(this.refs.path).value.trim();
    var fakeFile = this.props.collection.match({path: path}, true);
    var permalink = fakeFile.permalink(true);
    var url = this.pathHasError(path) ? '-' : this.props.config.siteUrl + permalink;
    this.setState({url: url});
  }
  handleSubmit(evt) {
    evt.preventDefault();
    var path = React.findDOMNode(this.refs.path).value.trim();

    var error = this.pathHasError(path);
    if(error) {
      this.setState({error: error});
      return;
    }

    app.hideModal();
    this.props.onCreate(path);
  }
}
