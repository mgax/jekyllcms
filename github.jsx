'use strict';


class GitHubFile {
  constructor(repo, item) {
    this.repo = repo;
    this.path = item.path;
    this.sha = item.sha;
  }

  content() {
    if(! this.sha) { return Q(''); }
    return Q($.ajax({
      url: `${this.repo.api}/git/blobs/${this.sha}`,
      headers: {Authorization: 'token ' + this.repo.token},
    }))
    .then((resp) =>
      atob(resp.content));
  }

  save(newContent) {
    return Q($.ajax({
      url: `${this.repo.api}/contents/${this.path}`,
      method: 'PUT',
      headers: {Authorization: 'token ' + this.repo.token},
      data: JSON.stringify({
        branch: 'gh-pages',
        message: "Edit from JekyllCMS",
        path: this.path,
        sha: this.sha,
        content: btoa(newContent)
      })
    }))
    .then((resp) => {
      this.sha = resp.content.sha;
    });
  }

  delete() {
    return Q($.ajax({
      url: `${this.repo.api}/contents/${this.path}`,
      method: 'DELETE',
      headers: {Authorization: 'token ' + this.repo.token},
      data: JSON.stringify({
        branch: 'gh-pages',
        message: "Edit from JekyllCMS",
        path: this.path,
        sha: this.sha,
      })
    }));
  }
}


class GitHubRepo {
  constructor(repoName, token) {
    this.repoName = repoName;
    this.token = token;
    this.api = `https://api.github.com/repos/${this.repoName}`;
  }

  files() {
    var url = `${this.api}/git/trees/gh-pages?recursive=1`;
    return Q($.ajax({
      url: url,
      headers: {Authorization: 'token ' + this.token},
    }))
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
