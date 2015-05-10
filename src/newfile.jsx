'use strict';

class NewFileModal extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      error: null,
      title: "New page",
      slug: '',
      ext: '.md',
      date: moment(),
      dirtyForm: true,
    };
  }
  prefix() {
    if(this.props.collection.name == 'posts') {
      return '_posts/' + this.state.date.format('YYYY-MM-DD') + '-';
    }
    else {
      return '';
    }
  }
  render() {
    var collectionSingular = this.props.collection.name.replace(/s$/, '');
    var datePicker = null;
    if(this.props.collection.name == 'posts') {
      datePicker = (
        <DatePicker
          dateFormat="YYYY-MM-DD"
          selected={this.state.date}
          onChange={this.handleDateChange.bind(this)}
          />
      );
    }

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
          {datePicker}
          <div className={'form-group' + (this.state.error ? ' has-error' : '' )}>
            <input
              className="form-control"
              value={this.state.title}
              onChange={this.handleTitleChange.bind(this)}
              ref="title"
              />
            {this.state.error ?
              <span className="help-block">Error: {this.state.error}</span>
            : null}
          </div>
          <p>
            File:
            <code>
              {this.prefix()}
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
    this.parseForm();
    setTimeout(() => React.findDOMNode(this.refs.title).select(), 500);
  }
  componentDidUpdate() {
    this.parseForm();
  }
  handleDateChange(date) {
    this.setState({date: date, dirtyForm: true});
  }
  handleTitleChange(e) {
    this.setState({title: e.target.value.trim(), dirtyForm: true, slug: ''});
  }
  handleSlugChange(e) {
    this.setState({slug: e.target.value, dirtyForm: true});
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

    if(! this.props.collection.match({path: path})) {
      return "Whoops, we have generated an invalid filename :(";
    }
  }
  parseForm() {
    if(! this.state.dirtyForm) { return; }
    var slug = this.state.slug || slugify(this.state.title);
    var path = generateUnique(
      (n) => this.prefix() + slug + n + this.state.ext,
      this.props.pathExists
    );
    this.setState({slug: slug, path: path, dirtyForm: false});

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
