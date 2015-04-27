'use strict';

var app = {};

$.get('config.json', (config) => {
  app.errorBox = React.render(<ErrorBox />, document.querySelector('#errors'));

  app.config = config;
  var authMatch = window.location.href.match(/\?code=(.*)/);
  if(authMatch) {
    initializeAuthCallback(authMatch[1]);
    return;
  }

  app.authToken = localStorage.getItem('jekyllcms-github-token');
  if(! app.authToken) {
    renderAuthButton();
    return;
  }

  app.gitHub = new GitHub(app.authToken);

  var repoMatch = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/);
  if(repoMatch) {
    app.gitHub.repo(repoMatch[1]).then((repo) =>
      initializeSite(repo));
  }
  else {
    app.gitHub.user().done((user) => {
      initializeHomepage(user);
    });
  }
});
