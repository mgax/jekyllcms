'use strict';

class Configuration {
  constructor(options) {
    this.siteUrl = options.siteUrl;
  }
  permalinkTemplate(collection) {
    if(collection == 'posts') {
      return '/:categories/:year/:month/:day/:title:output_ext';
    }
    else {
      return '/:path/:basename:output_ext';
    }
  }
}

var getConfig = (repo, tree) => {
  var getSiteUrl = () => {
    var cname = tree.filter((f) => f.path == 'CNAME')[0];
    if(cname) {
      return cname.getContent()
        .then((cnameValue) =>
          cnameValue.trim());
    }
    else {
      var name = repo.meta.name;
      var ownerLogin = repo.meta.owner.login;
      var siteUrl = ownerLogin + '.github.io/' + name;
      if(name == ownerLogin + '.github.io' || name == ownerLogin + '.github.com') {
        siteUrl = ownerLogin + '.github.io';
      }
      return Q(siteUrl);
    }
  };

  var siteUrl;
  return getSiteUrl()
    .then((value) => {
      siteUrl = value;
      return new Configuration({
        siteUrl: siteUrl,
      });
    });
};

class Site extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: null,
      config: null,
      branch: this.props.repo.branch(this.props.branchName),
    };
    this.ensureEmailIsVerified();
  }
  ensureEmailIsVerified() {
    var shouldVerifyEmail = () => {
      if(this.props.demo) {
        return Q(false);
      }
      else {
        return this.props.repo.gh.emailIsVerified()
          .then((isVerified) => ! isVerified);
      }
    }

    shouldVerifyEmail().then((shouldVerify) => {
      if(shouldVerify) {
        this.warnEmailNotVerified();
      }
      else {
        this.loadInitialFileList();
      }
    });
  }
  loadInitialFileList() {
    this.props.repo.branches()
      .then((branchList) => {
        var match = branchList.filter((b) =>
          b.name == this.props.branchName);
        if(match.length) {
          this.updateFileList();
        }
        else {
          this.createNewSite();
        }
      });
  }
  render() {
    var publicLink = null;
    if(this.state.config) {
      publicLink = (
        <a href={'http://' + this.state.config.siteUrl + '/'} target="_blank">
          <i className="fa fa-external-link inline-fa"></i>
        </a>
      );
    }

    var siteContents;
    if(this.state.tree && this.state.config) {
      siteContents = (
        <SiteContents
          ref="contents"
          tree={this.state.tree}
          createFile={this.createFile.bind(this)}
          onTreeChange={this.updateFileList.bind(this)}
          config={this.state.config}
          demo={this.props.demo}
          />
      );
    }
    else {
      siteContents = (
        <p className="loading">
          Loading <i className="fa fa-cog fa-spin" />
        </p>
      );
    }

    return (
      <div className="site">
        <h1>
          {this.props.repo.meta.full_name}{' '}
          {publicLink}
        </h1>
        {siteContents}
      </div>
    );
  }
  createFile(path) {
    return this.state.branch.newFile(path);
  }
  updateFileList() {
    this.state.branch.files()
      .then((tree) => {
        this.setState({tree: tree});
        getConfig(this.props.repo, tree)
          .then((config) => {
            this.setState({config: config});
          });
      })
      .catch(errorHandler("loading file list"));
  }
  createNewSite() {
    var handleSiteCreate = (options) => {
      options.repo = this.props.repo.meta.name;
      var tree = initialContent(options);
      this.props.repo.createBranch(this.props.branchName, tree)
        .then(() => {
          this.updateFileList();
        });
    };

    app.modal(
      <NewSiteModal
        fullName={this.props.repo.meta.full_name}
        branchName={this.props.branchName}
        onCreate={handleSiteCreate}
        />
    );
  }
  warnEmailNotVerified() {
    app.modal(
      <EmailNotVerified
        onRetry={this.ensureEmailIsVerified.bind(this)}
        />
    );
  }
}

class SiteWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    let {query} = this.props.location;
    let {userName, repoName} = this.props.params;
    let gitHub = GitHub.create(query.demo);
    return gitHub.repo(userName + '/' + repoName)
      .then((repo) => {
        this.setState({
          repo: repo,
          branchName: query['branch'] ? query['branch'] : repo.getDefaultBranchName()
        });
      })
      .catch(errorHandler("loading repository"));
  }
  render() {
    let {query} = this.props.location;
    let {userName} = this.props.params;
    let {branchName, repo} = this.state;
    if (!branchName) {
      return false
    }
    return <Site
      ref="site"
      repo={repo}
      branchName={branchName}
      demo={query.demo}
      />;
  }
}
