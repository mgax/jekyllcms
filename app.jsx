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
  var fileList = [];

  repo.files().done((tree) => {
    fileList = tree.filter((i) => {
      if(i.path == '.gitignore') return false;
      if(i.path == '_config.yml') return false;
      if(i.path.match(/^_layouts\//)) return false;
      return true;
    });

    renderSidebar();
  });

  function renderSidebar(f) {
    React.render(
      <IndexView
        data={fileList}
        onEdit={handleEdit}
        onCreate={handleCreate}
        />,
      document.querySelector('#index')
    );
  }

  function handleEdit(file) {
    var srcNode = document.querySelector('#src');
    React.unmountComponentAtNode(srcNode);
    React.render(<Editor file={file} />, srcNode);
  }

  function handleCreate() {
    modal(<NewFileModal onCreate={handleFileCreated} />);

    function handleFileCreated(path) {
      var file = repo.newFile(path);
      fileList.push(file);
      renderSidebar();
    }
  }
}


function modal(component) {
  var node = document.querySelector('#modal');
  React.unmountComponentAtNode(node);
  React.render(component, node);
  $('.modal', node).modal();
}


initialize();
