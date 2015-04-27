'use strict';

function parse(src) {
  var lines = src.split(/\n/);
  var frontMatterStart = lines.indexOf('---');
  if(frontMatterStart < 0) {
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

var FrontMatterField = React.createClass({
  render: function() {
    return (
      <input
        className="form-control"
        value={this.props.value}
        onChange={this.handleChange}
        placeholder={this.props.name}
        />
    );
  },
  handleChange: function(evt) {
    this.props.onChange(evt.target.value);
  }
});

var FrontMatter = React.createClass({
  getInitialState: function() {
    return {data: clone(this.props.data)};
  },
  render: function() {
    return <FrontMatterField
        name="title"
        value={this.state.data.title}
        onChange={this.handleChange.bind(this, 'title')}
        />;
  },
  handleChange: function(name, value) {
    var newData = clone(this.state.data);
    newData[name] = value;
    this.setState({data: newData});
    this.props.onChange(newData);
  },
  getData: function() {
    return this.state.data;
  }
});

var SaveButton = React.createClass({
  getInitialState: function() {
    return {state: 'ready'};
  },
  render: function() {
    var text = "save";
    if(this.state.state == 'success') { text += " ✔"; }
    if(this.state.state == 'saving') { text += " ..."; }
    return (
      <button
        className="btn btn-primary"
        disabled={this.state.state == 'saving'}
        onClick={this.handleSave}
        >{text}</button>
    );
  },
  handleSave: function() {
    this.setState({state: 'saving'});
    this.props.onSave()
      .done(() => {
        this.setState({state: 'success'});
      });
  }
});

var DeleteButton = React.createClass({
  render: function() {
    return (
      <button
        className="btn btn-danger"
        onClick={this.handleClick}
        >delete</button>
    )
  },
  handleClick: function() {
    modal(
      <DeleteFileModal
        path={this.props.file.path}
        onDelete={this.handleDelete}
        />
    );
  },
  handleDelete: function() {
    this.props.file.delete()
      .done(() => {
        this.props.onDelete();
      })
  }
});

var Editor = React.createClass({
  render: function() {
    var closebtn = (
      <div className="closeButton pull-right">
        <button className="close" onClick={this.handleClose}>&times;</button>
      </div>
    );
    var title = <h2><tt>{this.props.file.path}</tt></h2>;
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
          <CKEditor
            initial={this.state.content}
            onChange={this.handleChange}
            ref="contentEditor"
            />
        );
        var preview = null;
      }
      else {
        var editor = (
          <div className="content">
            <Ace
              initial={this.state.content}
              onChange={this.handleChange}
              ref="contentEditor"
              />
          </div>
        );
        var preview = (
          <div className="preview" dangerouslySetInnerHTML={{__html: html}} />
        );
      }
      return (
        <div>
          {closebtn}
          {title}
          <FrontMatter
            data={this.state.frontMatter}
            onChange={this.handleFrontMatterChange} />
          {editor}
          {preview}
          <p>
            <SaveButton onSave={this.handleSave} />
            &nbsp;
            <DeleteButton file={this.props.file} onDelete={this.handleDelete} />
          </p>
        </div>
      );
    }
  },
  getInitialState: function() {
    return {loading: true};
  },
  componentDidMount: function() {
    this.loadFile(this.props.file);
  },
  componentWillReceiveProps: function(newProps) {
    this.replaceState({loading: true});
    this.loadFile(newProps.file);
  },
  loadFile: function(file) {
    file.content().done((content) => {
      var newState = parse(decode_utf8(content));
      if(! this.state.loading) {
        this.refs.contentEditor.reset(newState.content);
      }
      newState.loading = false;
      this.replaceState(newState);
    });
  },
  handleChange: function(content) {
    this.setState({content: content});
  },
  handleFrontMatterChange: function(frontMatter) {
    this.setState({frontMatter: frontMatter});
  },
  handleSave: function() {
    var src = encode_utf8(
      '---\n' +
      jsyaml.safeDump(this.state.frontMatter) +
      '---\n' +
      this.state.content
    );
    return this.props.file.save(src);
  },
  handleDelete: function() {
    this.props.onDelete();
  },
  handleClose: function() {
    this.props.onClose();
  },
});
