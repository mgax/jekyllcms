'use strict';


class GitHubFile {
  constructor(repo, item) {
    this.repo = repo;
    this.path = item.path;
    this.sha = item.sha;
  }

  content() {
    if(! this.sha) { return Q(''); }
    return this.repo.api({url: '/git/blobs/' + this.sha})
      .then((resp) =>
        atob(resp.content));
  }

  save(newContent) {
    return this.repo.api({
      url: '/contents/' + this.path,
      method: 'PUT',
      data: JSON.stringify({
        branch: 'gh-pages',
        message: "Edit from JekyllCMS",
        path: this.path,
        sha: this.sha,
        content: btoa(newContent)
      })
    })
    .then((resp) => {
      this.sha = resp.content.sha;
    });
  }

  delete() {
    return this.repo.api({
      url: '/contents/' + this.path,
      method: 'DELETE',
      data: JSON.stringify({
        branch: 'gh-pages',
        message: "Edit from JekyllCMS",
        path: this.path,
        sha: this.sha,
      })
    });
  }
}


class GitHubRepo {
  constructor(repoName, token) {
    this.repoName = repoName;
    this.token = token;
  }

  api(options) {
    options.url = 'https://api.github.com/repos/' + this.repoName + options.url;
    options.headers = {Authorization: 'token ' + this.token}
    return Q($.ajax(options));
  }

  files() {
    return this.api({url: '/git/trees/gh-pages?recursive=1'})
      .then((resp) =>
        resp.tree
          .filter((i) => i.type == 'blob')
          .map((i) => new GitHubFile(this, i)));
  }

  newFile(path) {
    return new GitHubFile(this, {path: path});
  }
}


class GitHub {
  constructor(token) {
    this.token = token;
  }

  repo(repo) {
    return new GitHubRepo(repo, this.token);
  }
}
