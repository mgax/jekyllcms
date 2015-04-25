'use strict';

function renderAuthButton() {
  var authUrl = 'https://github.com/login/oauth/authorize' +
    '?client_id=' + encodeURIComponent(app.config.clientId) +
    '&scope=public_repo' +
    '&redirect_uri=' + encodeURIComponent(app.config.url);

  var view = <a href={authUrl}>authorize</a>;
  React.render(view, document.querySelector('#top'));
}

function initializeAuthCallback(code) {
  $.get(app.config.gatekeeper + '/authenticate/' + code, (resp) => {
    console.log(resp);
    if(resp.token) {
      localStorage.setItem('jekyllcms-github-token', resp.token);
      window.location.href = '/';
    }
  });
}
