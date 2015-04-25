'use strict';

var repoMatch = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/);
if(repoMatch) {
  initializeSite();
}
