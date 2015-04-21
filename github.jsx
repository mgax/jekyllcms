'use strict';


class GitHubFile {
  constructor(repo, item) {
    this.repo = repo;
    this.path = item.path;
    this.sha = item.sha;
  }

  content() {
    return Q($.get(`${this.repo.api}/git/blobs/${this.sha}`))
      .then((resp) =>
        atob(resp.content));
  }

  save(newContent) {
    return Q($.ajax({
      url: `${this.repo.api}/contents/${this.path}?access_token=${this.repo.token}`,
      method: 'PUT',
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
}


class GitHubRepo {
  constructor(repoName, token) {
    this.repoName = repoName;
    this.token = token;
    this.api = `https://api.github.com/repos/${this.repoName}`;
  }

  files() {
    var url = `${this.api}/git/trees/gh-pages?recursive=1`;
    return Q($.get(url))
      .then((resp) =>
        resp.tree
          .filter((i) => i.type == 'blob')
          .map((i) => new GitHubFile(this, i)));
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
