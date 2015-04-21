'use strict';


class GitHubRepo {
  constructor(repo) {
    this.repo = repo;
  }

  files() {
    var url = `https://api.github.com/repos/${this.repo}/git/trees/gh-pages?recursive=1`;
    return Q($.get(url)).then((resp) => resp.tree);
  }
}


class GitHub {
  repo(repo) {
    return new GitHubRepo(repo);
  }
}
