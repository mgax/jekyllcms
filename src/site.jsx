'use strict';

class Site extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: null,
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
    var editor = null;
    if(this.state.file) {
      editor = (
        <div className="editor-container row">
          <div className="editor col-sm-offset-2 col-sm-10">
            <Editor
              file={this.state.file}
              onDelete={this.handleDelete.bind(this)}
              onClose={this.handleClose.bind(this)}
              getUrl={this.getUrl.bind(this)}
              getSlug={this.getSlug.bind(this)}
              />
          </div>
        </div>
      );
    }
    var publicUrl = 'http://' + this.state.siteUrl + '/';
    return (
      <div className="site">
        <h1>
          {this.props.repo.meta.full_name}{' '}
          <a href={publicUrl} target="_blank">
            <i className="fa fa-external-link inline-fa"></i>
          </a>
        </h1>
        <IndexView
          fileList={this.state.fileList}
          current={this.state.file}
          onEdit={this.handleEdit.bind(this)}
          onCreate={this.handleCreate.bind(this)}
          getSlug={this.getSlug.bind(this)}
          />
        {editor}
      </div>
    );
  }
  updateFileList() {
    this.state.branch.files()
      .then((fileList) => {
        this.setState({fileList: fileList});
        var cname = fileList.filter((f) => f.path == 'CNAME')[0];
        if(cname) {
          return cname.content()
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
  handleEdit(file) {
    this.setState({file: file});
  }
  handleCreate() {
    var handleFileCreated = (path) => {
      var newFile = this.state.branch.newFile(path);
      this.setState({
        file: newFile,
        fileList: [].concat(this.state.fileList, [newFile]),
      });
    };

    var pathExists = (path) => {
      var matching = this.state.fileList.filter((f) => f.path == path);
      return matching.length > 0;
    };

    app.modal(
      <NewFileModal
        onCreate={handleFileCreated}
        pathExists={pathExists}
        getUrl={this.getUrl.bind(this)}
        />
    );
  }
  handleDelete() {
    this.setState({file: null});
    this.updateFileList();
  }
  handleClose() {
    this.setState({file: null});
  }
  getSlug(path) {
    var m = path.match(/^(.*\/)?([^\/]*)\.[^\.]+$/);
    var filename = (m[2] == 'index') ? '' : m[2];
    var folder = m[1] || '';
    return folder + filename;
  }
  getUrl(path) {
    return this.state.siteUrl + '/' + this.getSlug(path);
  }
  createNewSite() {
    var handleSiteCreate = (options) => {
      var index_md =
        "---\n" +
        "title: Homepage\n" +
        "---\n" +
        "# " + options.title + "\n\n" +
        "Welcome to your new JekyllCMS website!\n";
      var fileList = [
        {path: '_config.yml', content: jsyaml.safeDump({title: options.title})},
        {path: 'index.md', content: index_md},
      ];
      this.props.repo.createBranch(this.props.branchName, fileList)
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
