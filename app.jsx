'use strict';

var IndexItem = React.createClass({
  render: function() {
    return <li>{this.props.path}</li>;
  }
});

var IndexView = React.createClass({
  render: function() {
    var indexItemList = this.props.data.map((item) =>
      <IndexItem path={item.path} />
    );
    return <ul>{indexItemList}</ul>;
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
