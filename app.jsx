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

var IndexItem = React.createClass({
  render: function() {
    return <li><a onClick={this.handleClick}>{this.props.item.path}</a></li>;
  },
  handleClick: function(evt) {
    evt.preventDefault();
    edit(this.props.item);
  }
});

var IndexView = React.createClass({
  render: function() {
    var indexItemList = this.props.data.map((item) => <IndexItem item={item} />);
    return <ul className="list-unstyled">{indexItemList}</ul>;
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

var SrcView = React.createClass({
  render: function() {
    var title = <h2><tt>{this.props.item.path}</tt></h2>;
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
            <button className="btn btn-primary" onClick={this.handleSave}>
              save
            </button>
          </p>
        </div>
      );
    }
    else {
      return (
        <div>
          {title}
          <p>loading <tt>{this.props.item.path}</tt> ...</p>
        </div>
      );
    }
  },
  componentDidMount: function() {
    this.props.item.content().done((content) => this.setState(parse(content)));
  },
  handleChange: function(content) {
    this.setState({content: content});
  },
  handleSave: function() {
    var src = '---\n' + this.state.frontMatter + '---\n' + this.state.content;
    console.log(src);
  }
});

var repoMatch = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/);
if(repoMatch) {
  var repo = repoMatch[1];

  var files = new GitHub().repo(repo).files();
  files.done((tree) => {
    var fileList = tree.filter((i) => {
      if(i.path == '.gitignore') return false;
      if(i.path == '_config.yml') return false;
      if(i.path.match(/^_layouts\//)) return false;
      return true;
    });

    React.render(
      <IndexView data={fileList} />,
      document.querySelector('#index')
    );
  });
}

function edit(item) {
  var srcNode = document.querySelector('#src')
  React.unmountComponentAtNode(srcNode);
  React.render(<SrcView item={item} />, srcNode);
}
