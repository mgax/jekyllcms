'use strict';


class GitHubFile {
  constructor(repo, item) {
    this.item = item;
    this.path = this.item.path;
  }

  content() {
    return Q($.get(this.item.url))
      .then((resp) =>
        atob(resp.content));
  }
}


class GitHubRepo {
  constructor(repo) {
    this.repo = repo;
  }

  files() {
    var url = `https://api.github.com/repos/${this.repo}/git/trees/gh-pages?recursive=1`;
    return Q($.get(url))
      .then((resp) =>
        resp.tree
          .filter((i) => i.type == 'blob')
          .map((i) => new GitHubFile(this, i)));
  }
}


class GitHub {
  repo(repo) {
    return new GitHubRepo(repo);
  }
}
