'use strict';


class GitHubFile {
  constructor(branch, item) {
    this.branch = branch;
    this.path = item.path;
    this.sha = item.sha;
  }

  api(options) {
    return this.branch.repo.api(options);
  }

  content() {
    if(! this.sha) { return Q(''); }
    return this.api({url: '/git/blobs/' + this.sha})
      .then((resp) =>
        atob(resp.content));
  }

  save(newContent) {
    return this.api({
      url: '/contents/' + this.path,
      method: 'PUT',
      data: JSON.stringify({
        branch: this.branch.name,
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
    return this.api({
      url: '/contents/' + this.path,
      method: 'DELETE',
      data: JSON.stringify({
        branch: this.branch.name,
        message: "Edit from JekyllCMS",
        path: this.path,
        sha: this.sha,
      })
    });
  }
}


class GitHubBranch {
  constructor(repo, name) {
    this.repo = repo;
    this.name = name;
  }

  files() {
    var t = new Date().getTime();
    var url = '/git/trees/' + this.name + '?recursive=1&t=' + t;
    return this.repo.api({url: url})
      .then((resp) =>
        resp.tree
          .filter((i) => i.type == 'blob')
          .map((i) => new GitHubFile(this, i)));
  }

  newFile(path) {
    return new GitHubFile(this, {path: path});
  }
}


class GitHubRepo {
  constructor(gh, meta) {
    this.gh = gh;
    this.meta = meta;
  }

  api(options) {
    options.url = '/repos/' + this.meta.full_name + options.url;
    return this.gh.api(options);
  }

  branch(name) {
    return new GitHubBranch(this, name);
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
          new GitHubRepo(this.gh, meta))
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

  repo(fullName) {
    return this.api({url: '/repos/' + fullName})
      .then((meta) =>
        new GitHubRepo(this, meta));
  }

  user() {
    return this.api({url: '/user'}).then((meta) => new GitHubUser(this, meta));
  }
}
