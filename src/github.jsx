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
  constructor(gh, fullName, meta) {
    this.gh = gh;
    this.fullName = fullName;
    this.meta = meta;
  }

  api(options) {
    options.url = '/repos/' + this.fullName + options.url;
    return this.gh.api(options);
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


class GitHubAccount {
  constructor(gh, meta) {
    this.gh = gh;
    this.meta = meta;
  }

  repos() {
    var size = 100;
    var fetch = (n, rv) =>
      this.gh.api({url: this.meta.repos_url + '?per_page='+size+'&page='+n})
        .then((resp) => {
          rv = rv.concat(resp);
          if(resp.length < size) { return rv; }
          else { return fetch(n+1, rv); }
        });

    return fetch(1, [])
      .then((repos) =>
        repos.map((meta) =>
          new GitHubRepo(this.gh, meta.full_name, meta))
      );
  }
}


class GitHubUser {
  constructor(gh, meta) {
    this.gh = gh;
    this.meta = meta;
    this.account = new GitHubAccount(this.gh, this.meta);
  }

  orgs() {
    return this.gh.api({url: this.meta.organizations_url})
      .then((resp) =>
        resp.map((acc) =>
          new GitHubAccount(this.gh, acc)));
  }

  repos() {
    return this.account.repos();
  }
}


class GitHub {
  constructor(token) {
    this.token = token;
  }

  api(options) {
    var apiUrl = 'https://api.github.com';
    if(options.url.indexOf(apiUrl) < 0) {
      options.url = apiUrl + options.url;
    }
    options.headers = {Authorization: 'token ' + this.token}
    return Q($.ajax(options));
  }

  repo(repo) {
    return new GitHubRepo(this, repo);
  }

  user() {
    return this.api({url: '/user'}).then((meta) => new GitHubUser(this, meta));
  }
}
