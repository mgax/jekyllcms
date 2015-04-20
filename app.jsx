'use strict';

$.get('https://api.github.com/repos/mgax/jekyllcms-testsite/git/trees/gh-pages?recursive=1', function(resp) {
  console.log(
    resp.tree.filter(function(i) {
      if(i.type != 'blob') return false;
      if(i.path == '.gitignore') return false;
      if(i.path == '_config.yml') return false;
      if(i.path.match(/^_layouts\//)) return false;
      return true;
    })
  );
});

console.log(1);
