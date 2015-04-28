'use strict';

class Site extends React.Component {
  constructor(props) {
    super(props);
    this.state = {fileList: null, siteUrl: ''};
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
              />
          </div>
        </div>
      );
    }
    return (
      <div className="site">
        <h1>{this.props.repo.meta.full_name}</h1>
        <IndexView
          fileList={this.state.fileList}
          current={this.state.file}
          onEdit={this.handleEdit.bind(this)}
          onCreate={this.handleCreate.bind(this)}
          />
        {editor}
      </div>
    );
  }
  componentDidMount() {
    this.updateFileList();
  }
  updateFileList() {
    this.props.branch.files()
      .then((tree) => {
        var fileList = tree.filter((i) => ! i.path.match(/^[_.]/));
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
      var newFile = this.props.branch.newFile(path);
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
  getUrl(path) {
    var m = path.match(/^(.*\/)?([^\/]*)\.[^\.]+$/);
    var filename = (m[2] == 'index') ? '' : m[2] + '.html';
    var folder = m[1] || '';
    return this.state.siteUrl + '/' + folder + filename;
  }
}
