'use strict';

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
    return <ul>{indexItemList}</ul>;
  }
});

var SrcView = React.createClass({
  render: function() {
    return <p>loading <tt>{this.props.item.path}</tt> ...</p>;
  }
});

var repo = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/)[1];
var url = `https://api.github.com/repos/${repo}/git/trees/gh-pages?recursive=1`;

$.get(url, (resp) => {
  var fileList = resp.tree.filter((i) => {
    if(i.type != 'blob') return false;
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

function edit(item) {
  React.render(
    <SrcView item={item} />,
    document.querySelector('#src')
  );
}
