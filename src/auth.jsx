'use strict';

function renderAuthButton() {
  var authUrl = 'https://github.com/login/oauth/authorize' +
    '?client_id=' + encodeURIComponent(app.config.clientId) +
    '&scope=public_repo' +
    '&redirect_uri=' + encodeURIComponent(app.config.url);

  var view = <a className="btn btn-success" href={authUrl}>login</a>;
  React.render(view, document.querySelector('#top'));
}

function initializeAuthCallback(code) {
  $.get(app.config.gatekeeper + '/authenticate/' + code, (resp) => {
    if(resp.token) {
      localStorage.setItem('jekyllcms-github-token', resp.token);
      window.location.href = '/';
    }
  });
}

function logoutButton() {
  var logout = function() {
    localStorage.removeItem('jekyllcms-github-token');
    window.location.href = '/';
  };
  return <a className="btn btn-default" onClick={logout}>logout</a>;
}
