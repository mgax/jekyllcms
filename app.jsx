'use strict';

Q.longStackSupport = true;

function assert(cond) {
  if(! cond) {
    throw "assertion failed";
  }
}

function parse(src) {
  var lines = src.split(/\n/);
  assert(lines[0] == '---');
  lines = lines.slice(1);
  var frontMatterEnd = lines.indexOf('---');
  assert(frontMatterEnd > -1);
  return {
    frontMatter: lines.slice(0, frontMatterEnd).join('\n') + '\n',
    content: lines.slice(frontMatterEnd + 1).join('\n')
  }
}

var IndexFile = React.createClass({
  render: function() {
    return <li><a onClick={this.handleClick}>{this.props.file.path}</a></li>;
  },
  handleClick: function(evt) {
    evt.preventDefault();
    this.props.onEdit(this.props.file);
  }
});

var IndexView = React.createClass({
  render: function() {
    var indexFileList = this.props.data.map((file) =>
      <IndexFile file={file} onEdit={this.props.onEdit} />
    );
    return <ul className="list-unstyled">{indexFileList}</ul>;
  }
});

var CodeEditor = React.createClass({
  render: function() {
    return <div ref="ace" className="codeEditor" />;
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

var SrcView = React.createClass({
  render: function() {
    var title = <h2><tt>{this.props.file.path}</tt></h2>;
    if(this.state) {
      var html = marked(this.state.content, {sanitize: true});
      return (
        <div>
          {title}
          <pre><code>{this.state.frontMatter}</code></pre>
          <div className="content">
            <CodeEditor
              initial={this.state.content}
              onChange={this.handleChange}
              />
          </div>
          <div className="preview" dangerouslySetInnerHTML={{__html: html}} />
          <p>
            <SaveButton onSave={this.handleSave} />
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
  handleSave: function() {
    var src = '---\n' + this.state.frontMatter + '---\n' + this.state.content;
    return this.props.file.save(src);
  }
});

var repoMatch = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/);
if(repoMatch) {
  var repo = repoMatch[1];

  var token = localStorage.getItem('jekyllcms-github-token');
  var files = new GitHub(token).repo(repo).files();
  files.done((tree) => {
    var fileList = tree.filter((i) => {
      if(i.path == '.gitignore') return false;
      if(i.path == '_config.yml') return false;
      if(i.path.match(/^_layouts\//)) return false;
      return true;
    });

    React.render(
      <IndexView data={fileList} onEdit={handleEdit} />,
      document.querySelector('#index')
    );
  });
}

function handleEdit(file) {
  var srcNode = document.querySelector('#src');
  React.unmountComponentAtNode(srcNode);
  React.render(<SrcView file={file} />, srcNode);
}
