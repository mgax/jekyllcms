'use strict';

class NewFileModal extends React.Component {
  constructor (props) {
    super(props);
    this.state = {error: null, prefix: '', slug: '', ext: '.md'};
  }
  render() {
    var collectionSingular = this.props.collection.name.replace(/s$/, '');
    return (
      <form className="modal-content newFile" onSubmit={this.handleSubmit.bind(this)}>
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
              placeholder="title"
              ref="title"
              defaultValue="New page"
              onChange={() => this.parseForm()}
              />
            {this.state.error ?
              <span className="help-block">Error: {this.state.error}</span>
            : null}
          </div>
          <p>
            File:
            <code>
              {this.state.prefix}
              <input
                className="slug"
                ref="slug"
                value={this.state.slug}
                onChange={this.handleSlugChange.bind(this)}
                size={Math.min(this.state.slug.length, 50)}
                />
              {this.state.ext}
            </code>
          </p>
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
    setTimeout(() => React.findDOMNode(this.refs.title).select(), 500);
    this.parseForm();
  }
  handleSlugChange(e) {
    var customSlug = e.target.value;
    this.parseForm(customSlug);
  }
  hasError(slug, path) {
    if(slug == '' || slug == '-') {
      return "Title is too short";
    }

    if(slug.match(/\/$/)) {
      return "Slug may not end with '/'";
    }

    if(! path.match(/\.(md|markdown|html)$/)) {
      return "Invalid file name";
    }

    if(this.props.pathExists(path)) {
      return "File already exists";
    }
  }
  parseForm(customSlug) {
    var title = React.findDOMNode(this.refs.title).value.trim();
    var slug = customSlug || slugify(title);
    var path = generateUnique(
      (n) => this.state.prefix + slug + n + this.state.ext,
      this.props.pathExists
    );
    this.setState({slug: slug, path: path});

    var error = this.hasError(slug, path);
    if(error) {
      this.setState({error: error, url: '-'});
    }
    else {
      var fakeFile = this.props.collection.match({path: path}, true);
      var url = this.props.config.siteUrl + fakeFile.permalink(true);
      this.setState({error: null, url: url});
    }
  }
  handleSubmit(evt) {
    evt.preventDefault();
    if(this.state.error) { return; }
    app.hideModal();
    this.props.onCreate(this.state.path);
  }
}
