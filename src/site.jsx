'use strict';

class Site extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: null,
      siteUrl: '',
      branch: this.props.repo.branch(this.props.branchName),
    };
    this.ensureEmailIsVerified();
  }
  ensureEmailIsVerified() {
    this.props.repo.gh.emailIsVerified()
      .then((isVerified) => {
        if(isVerified) {
          this.loadInitialFileList();
        }
        else {
          this.warnEmailNotVerified();
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
    var publicUrl = 'http://' + this.state.siteUrl + '/';
    var siteContents;
    if(this.state.tree) {
      siteContents = (
        <SiteContents
          tree={this.state.tree}
          onTreeChange={this.updateFileList.bind(this)}
          siteUrl={this.state.siteUrl}
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
          <a href={publicUrl} target="_blank">
            <i className="fa fa-external-link inline-fa"></i>
          </a>
        </h1>
        {siteContents}
      </div>
    );
  }
  updateFileList() {
    this.state.branch.files()
      .then((tree) => {
        this.setState({tree: tree});
        var cname = tree.filter((f) => f.path == 'CNAME')[0];
        if(cname) {
          return cname.getContent()
            .then((cnameValue) =>
              this.setState({siteUrl: cnameValue.trim()}));
        }
        else {
          var repo = this.props.repo;
          var name = repo.meta.name;
          var ownerLogin = repo.meta.owner.login;
          this.setState({siteUrl: ownerLogin + '.github.io/' + name});
        }
      })
      .catch(errorHandler("loading file list"));
  }
  createNewSite() {
    var handleSiteCreate = (options) => {
      var index_md =
        "---\n" +
        "title: Homepage\n" +
        "---\n" +
        "# " + options.title + "\n\n" +
        "Welcome to your new JekyllCMS website!\n";
      var tree = [
        {path: '_config.yml', content: jsyaml.safeDump({title: options.title})},
        {path: 'index.md', content: index_md},
      ];
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
