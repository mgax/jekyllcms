'use strict';

var app = {};

$.get('config.json', (config) => {
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

  var repoMatch = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/);
  if(repoMatch) {
    initializeSite(repoMatch[1]);
  }
});
