'use strict';

function parse(src) {
  var lines = src.split(/\n/);
  var frontMatterStart = lines.indexOf('---');
  if(frontMatterStart != 0) {
    return {
      frontMatter: {},
      content: src
    }
  }
  var frontMatterEnd = lines.indexOf('---', frontMatterStart + 1);
  assert(frontMatterEnd > -1);
  return {
    frontMatter: jsyaml.safeLoad(
      lines.slice(frontMatterStart + 1, frontMatterEnd).join('\n') + '\n'
    ),
    content: lines.slice(frontMatterEnd + 1).join('\n')
  }
}

var clone = (value) => JSON.parse(JSON.stringify(value));

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
    if(this.props.file.sha) {
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
    var closebtn = (
      <div className="closeButton pull-right">
        <button
          className="close"
          onClick={this.handleClose.bind(this)}
          >&times;</button>
      </div>
    );
    var publicUrl = 'http://' + this.props.getUrl(this.props.file.path);
    var title = (
      <h2>
        <tt>{this.props.getSlug(this.props.file.path)}</tt>{' '}
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
          <p>loading <tt>{this.props.file.path}</tt> ...</p>
        </div>
      );
    }
    else {
      var html = marked(this.state.content, {sanitize: true});
      if(this.props.file.path.match(/\.html/)) {
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
    file.content()
      .then((content) => {
        var data = parse(decode_utf8(content));
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
    var src = encode_utf8(
      '---\n' +
      jsyaml.safeDump(this.state.frontMatter) +
      '---\n' +
      this.state.content
    );
    return this.props.file.save(src).catch(errorHandler("saving file"));
  }
  handleDelete() {
    this.props.onDelete();
  }
  handleClose() {
    this.props.onClose();
  }
}
