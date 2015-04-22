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

var Ace = React.createClass({
  render: function() {
    return <div ref="ace" className="aceContainer" />;
  },
  componentDidMount: function() {
    var node = React.findDOMNode(this.refs.ace);
    $(node).text(this.props.initial);
    this.ace = ace.edit(node);
    this.ace.getSession().setMode('ace/mode/markdown');
    this.ace.setTheme('ace/theme/tomorrow_night_eighties');
    this.ace.setShowInvisibles(true);
    this.ace.on('change', (e) => this.handleChange(e));
  },
  handleChange: function() {
    this.props.onChange(this.ace.getValue());
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
    var title = <h2><tt>{this.props.file.path}</tt></h2>;
    if(this.state) {
      var html = marked(this.state.content, {sanitize: true});
      return (
        <div>
          {title}
          <FrontMatter
            data={this.state.frontMatter}
            onChange={this.handleFrontMatterChange} />
          <div className="content">
            <Ace initial={this.state.content} onChange={this.handleChange} />
          </div>
          <div className="preview" dangerouslySetInnerHTML={{__html: html}} />
          <p>
            <SaveButton onSave={this.handleSave} />
            &nbsp;
            <DeleteButton file={this.props.file} onDelete={this.handleDelete} />
          </p>
        </div>
      );
    }
    else {
      return (
        <div>
          {title}
          <p>loading <tt>{this.props.file.path}</tt> ...</p>
        </div>
      );
    }
  },
  componentDidMount: function() {
    this.props.file.content().done((content) => this.setState(parse(content)));
  },
  handleChange: function(content) {
    this.setState({content: content});
  },
  handleFrontMatterChange: function(frontMatter) {
    this.setState({frontMatter: frontMatter});
  },
  handleSave: function() {
    var src = '---\n' + jsyaml.safeDump(this.state.frontMatter) + '---\n' + this.state.content;
    return this.props.file.save(src);
  },
  handleDelete: function() {
    React.unmountComponentAtNode(React.findDOMNode(this).parentNode);
    this.props.onDelete();
  },
});
