'use strict';

var app = {};

$.get('config.json', (config) => {
  app.errorBox = React.render(<ErrorBox />, document.querySelector('#errors'));

  var topNode = document.querySelector('#top');
  app.config = config;
  var authMatch = window.location.href.match(/\?code=(.*)/);
  if(authMatch) {
    React.render(<AuthCallback code={authMatch[1]} />, topNode);
    return;
  }

  app.authToken = localStorage.getItem('jekyllcms-github-token');
  if(! app.authToken) {
    React.render(<AuthButton />, topNode);
    return;
  }

  app.gitHub = new GitHub(app.authToken);

  var repoMatch = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/);
  if(repoMatch) {
    app.gitHub.repo(repoMatch[1])
      .then((repo) =>
        React.render(<Site repo={repo} />, topNode))
      .catch(errorHandler("loading repository"));
  }
  else {
    app.gitHub.user()
      .then((user) =>
        React.render(<Home user={user} />, topNode))
      .catch(errorHandler("loading user information"));
  }
});
