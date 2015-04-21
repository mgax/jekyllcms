'use strict';

Q.longStackSupport = true;

function assert(cond) {
  if(! cond) {
    throw "assertion failed";
  }
}

function initialize() {
  var repoMatch = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/);
  if(! repoMatch) return;

  var gitHub = new GitHub(localStorage.getItem('jekyllcms-github-token'));
  var repo = gitHub.repo(repoMatch[1]);
  repo.files().done((tree) => {
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

  function handleEdit(file) {
    var srcNode = document.querySelector('#src');
    React.unmountComponentAtNode(srcNode);
    React.render(<Editor file={file} />, srcNode);
  }
}


initialize();
