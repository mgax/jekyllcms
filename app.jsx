'use strict';

var repo = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/)[1];
var url = `https://api.github.com/repos/${repo}/git/trees/gh-pages?recursive=1`;
$.get(url, (resp) => {
  for(var r of resp.tree.filter((i) => {
      if(i.type != 'blob') return false;
      if(i.path == '.gitignore') return false;
      if(i.path == '_config.yml') return false;
      if(i.path.match(/^_layouts\//)) return false;
      return true;
    })) {
    console.log(r);
  }
});

console.log(1);
