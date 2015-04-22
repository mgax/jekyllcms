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

  var app = window.app = {};
  app.gitHub = new GitHub(localStorage.getItem('jekyllcms-github-token'));
  app.repo = app.gitHub.repo(repoMatch[1]);
  app.fileList = [];

  app.repo.files().done((tree) => {
    app.fileList = tree.filter((i) => ! i.path.match(/^[_.]/));
    renderSidebar();
  });

  function renderSidebar(f) {
    React.render(
      <IndexView
        data={app.fileList}
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
      var file = app.repo.newFile(path);
      app.fileList.push(file);
      renderSidebar();
      handleEdit(file);
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
