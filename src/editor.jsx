'use strict';

class FrontMatterField extends React.Component {
  render() {
    return (
      <input
        className="form-control"
        value={this.props.value}
        onChange={this.handleChange.bind(this)}
        placeholder={this.props.name}
        />
    );
  }
  handleChange(evt) {
    this.props.onChange(evt.target.value);
  }
}

class FrontMatter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: clone(this.props.data)};
  }
  render() {
    return <FrontMatterField
        name="title"
        value={this.state.data.title}
        onChange={this.handleChange.bind(this, 'title')}
        />;
  }
  handleChange(name, value) {
    var newData = clone(this.state.data);
    newData[name] = value;
    this.setState({data: newData});
    this.props.onChange(newData);
  }
  getData() {
    return this.state.data;
  }
}

class SaveButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {state: 'ready'};
  }
  render() {
    var text = "save";
    if(this.state.state == 'success') { text += " ✔"; }
    if(this.state.state == 'saving') { text += " ..."; }
    return (
      <button
        className="btn btn-primary"
        disabled={this.state.state == 'saving'}
        onClick={this.handleSave.bind(this)}
        >{text}</button>
    );
  }
  handleSave() {
    this.setState({state: 'saving'});
    this.props.onSave()
      .done(() => {
        this.setState({state: 'success'});
      });
  }
}

class DeleteButton extends React.Component {
  render() {
    return (
      <button
        className="btn btn-danger"
        onClick={this.handleClick.bind(this)}
        >delete</button>
    )
  }
  handleClick() {
    app.modal(
      <DeleteFileModal
        path={this.props.file.path}
        onDelete={this.handleDelete.bind(this)}
        />
    );
  }
  handleDelete() {
    if(this.props.file.isSaved()) {
      this.props.file.delete()
        .then(() => {
          this.props.onDelete();
        })
        .catch(errorHandler("deleting file"));
    }
    else {
      this.props.onDelete();
    }
  }
}

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loading: true};
  }
  render() {
    var path = this.props.file.path;
    var closebtn = (
      <div className="closeButton pull-right">
        <button
          className="close"
          onClick={this.handleClose.bind(this)}
          >&times;</button>
      </div>
    );
    var permalink = this.props.file.permalink(true);
    var publicUrl = 'http://' + this.props.config.siteUrl + permalink;
    var title = (
      <h2>
        <tt title={path}>{permalink}</tt>{' '}
        <a href={publicUrl} target="_blank">
          <i className="fa fa-external-link inline-fa"></i>
        </a>
      </h2>
    );
    if(this.state.loading) {
      return (
        <div>
          {closebtn}
          {title}
          <p>loading <tt>{path}</tt> ...</p>
        </div>
      );
    }
    else {
      var html = marked(this.state.content, {sanitize: true});
      if(path.match(/\.html/)) {
        var editor = (
          <div className="contentEditor">
            <CKEditor
              initial={this.state.content}
              onChange={this.handleChange.bind(this)}
              ref="contentEditor"
              />
          </div>
        );
        var preview = null;
      }
      else {
        var editor = (
          <div className="contentEditor">
            <Ace
              initial={this.state.content}
              onChange={this.handleChange.bind(this)}
              ref="contentEditor"
              />
          </div>
        );
        var preview = (
          <div
            className="preview well"
            dangerouslySetInnerHTML={{__html: html}}
            />
        );
      }
      return (
        <div>
          {closebtn}
          {title}
          <FrontMatter
            data={this.state.frontMatter}
            onChange={this.handleFrontMatterChange.bind(this)} />
          {editor}
          {preview}
          <p>
            <SaveButton onSave={this.handleSave.bind(this)} />
            &nbsp;
            <DeleteButton
              file={this.props.file}
              onDelete={this.handleDelete.bind(this)}
              />
          </p>
        </div>
      );
    }
  }
  componentDidMount() {
    this.loadFile(this.props.file);
  }
  componentWillReceiveProps(newProps) {
    this.setState({
      loading: true,
      frontMatter: null,
      content: null,
    });
    this.loadFile(newProps.file);
  }
  loadFile(file) {
    file.load()
      .then((data) => {
        if(! this.state.loading) {
          this.refs.contentEditor.reset(data.content);
        }
        this.setState({
          loading: false,
          frontMatter: data.frontMatter,
          content: data.content,
        });
      })
      .catch(errorHandler("loading file contents"));
  }
  handleChange(content) {
    this.setState({content: content});
  }
  handleFrontMatterChange(frontMatter) {
    this.setState({frontMatter: frontMatter});
  }
  handleSave() {
    return this.props.file
      .save({
        frontMatter: this.state.frontMatter,
        content: this.state.content,
      })
      .catch(errorHandler("saving file"));
  }
  handleDelete() {
    this.props.onDelete();
  }
  handleClose() {
    this.props.onClose();
  }
}
