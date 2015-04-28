'use strict';

var app = {};

function route() {
  var authMatch = window.location.href.match(/\?code=(.*)/);
  if(authMatch) {
    return Q(<AuthCallback code={authMatch[1]} />);
  }

  app.authToken = localStorage.getItem('jekyllcms-github-token');
  if(! app.authToken) {
    return Q(<AuthButton />);
  }

  app.gitHub = new GitHub(app.authToken);

  var repoMatch = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/);
  if(repoMatch) {
    return app.gitHub.repo(repoMatch[1])
      .then((repo) => <Site repo={repo} />)
      .catch(errorHandler("loading repository"));
  }
  else {
    return app.gitHub.user()
      .then((user) => <Home user={user} />)
      .catch(errorHandler("loading user information"));
  }
}

$.get('config.json', (config) => {
  app.errorBox = React.render(<ErrorBox />, document.querySelector('#errors'));

  app.config = config;
  route().then((view) =>
    React.render(view, document.querySelector('#top'))
  );
});
