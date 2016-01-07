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

  getContent() {
    if(! this.sha) { return Q(''); }
    return this.api({url: '/git/blobs/' + this.sha})
      .then((resp) =>
        atob(resp.content.replace(/\s/g, '')));
  }

  putContent(newContent) {
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

  contentUrl() {
    return 'https://raw.githubusercontent.com/'
      + this.branch.repo.meta.full_name
      + '/' + this.branch.name
      + '/' + this.path;
  }
}


class GitHubBranch {
  constructor(repo, name) {
    this.repo = repo;
    this.name = name;
  }

  files() {
    var url = '/git/trees/' + this.name + '?recursive=1';
    return this.repo.api({url: url, t: true})
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

  branches() {
    return this.api({url: '/branches', t: true}).then((resp) =>
      resp.map((b) =>
        new GitHubBranch(this, b.name)));
  }

  branch(name) {
    return new GitHubBranch(this, name);
  }

  createBranch(name, fileList) {
    var branch = this.branch(name);

    var putFiles = (remaining) => {
      var file = remaining[0];
      if(! file) { return; }

      var githubFile = (new GitHubFile(branch, {path: file.path}));
      return githubFile.putContent(file.content)
        .then(() =>
          putFiles(remaining.slice(1)))
    };

    return putFiles(fileList);
  }

  getDefaultBranchName() {
    return (
      this.meta.name == this.meta.owner.login + '.github.com' ||
      this.meta.name == this.meta.owner.login + '.github.io'
        ? 'master'
        : 'gh-pages'
    );
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
      this.gh.api({
          url: this.meta.repos_url + '?per_page='+size+'&page='+n,
          t: true,
        })
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
    return this.gh.api({url: this.meta.organizations_url, t: true})
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

  static create(demo) {
    var gitHub = null;
    if(demo) {
      return new GitHub();
    }
    else {
      let authToken = localStorage.getItem('jekyllcms-github-token');
      if(! authToken) {
        return null;
      }
      return new GitHub(authToken);// todo: add catch handlers
    }
  }

  api(options) {
    var apiUrl = 'https://api.github.com';
    if(options.url.indexOf(apiUrl) < 0) {
      options.url = apiUrl + options.url;
    }
    if(options.t) {
      var t = new Date().getTime();
      var sep = options.url.match(/\?/) ? '&' : '?';
      options.url += sep + 't=' + t;
    }
    if(this.token) {
      options.headers = {Authorization: 'token ' + this.token};
    }
    return Q($.ajax(options));
  }

  repo(fullName) {
    return this.api({url: '/repos/' + fullName, t: true})
      .then((meta) =>
        new GitHubRepo(this, meta));
  }

  user(login) {
    var url = (login ? '/users/' + login : '/user');
    return this.api({url: url, t: true})
      .then((meta) =>
        new GitHubUser(this, meta));
  }

  authenticatedUserLogin() {
    return this.api({url: '/user', t: true})
      .then((meta) => meta.login);
  }

  emailIsVerified() {
    return this.api({url: '/user/emails', t: true}).then((resp) =>
      resp.filter((i) => i.verified).length > 0);
  }
}
