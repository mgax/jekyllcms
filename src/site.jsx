'use strict';

function extractCollections(tree) {
  var collections = {
    posts: new Collection('posts'),
    pages: new Collection('pages'),
  };

  tree.forEach((ghFile) => {
    if(ghFile.path.match(/^_posts\//)) {
      collections.posts.files.push(new File(ghFile));
      return;
    }
    if(ghFile.path.match(/^[^_.]/)) {
      collections.pages.files.push(new File(ghFile));
      return;
    }
  });

  return collections;
}

class Sitemap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {collections: extractCollections(props.tree)};
  }
  componentWillReceiveProps(props) {
    this.setState({collections: extractCollections(props.tree)});
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
              siteUrl={this.props.siteUrl}
              />
          </div>
        </div>
      );
    }

    return (
      <div>
        <IndexView
          collections={this.state.collections}
          current={this.state.file}
          onEdit={this.handleEdit.bind(this)}
          onCreate={this.handleCreate.bind(this)}
          />
        {editor}
      </div>
    );
  }
  handleEdit(file) {
    this.setState({file: file});
  }
  handleCreate() {
    console.error('FIXME fileList -> collections'); return;
    var handleFileCreated = (path) => {
      var file = new File(this.state.branch.newFile(path));
      this.setState({
        file: file,
        fileList: [].concat(this.state.fileList, [file]),
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
        siteUrl={this.props.siteUrl}
        />
    );
  }
  handleDelete() {
    this.setState({file: null});
    this.props.onTreeChange();
  }
  handleClose() {
    this.setState({file: null});
  }
}

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
    var sitemap;
    if(this.state.tree) {
      sitemap = (
        <Sitemap
          tree={this.state.tree}
          onTreeChange={this.updateFileList.bind(this)}
          siteUrl={this.state.siteUrl}
          />
      );
    }
    else {
      sitemap = 'loading ...';
    }
    return (
      <div className="site">
        <h1>
          {this.props.repo.meta.full_name}{' '}
          <a href={publicUrl} target="_blank">
            <i className="fa fa-external-link inline-fa"></i>
          </a>
        </h1>
        {sitemap}
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
