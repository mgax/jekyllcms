'use strict';

class Site extends React.Component {
  constructor(props) {
    super(props);
    this.state = {fileList: null};
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
      .then((tree) =>
        this.setState({fileList: tree.filter((i) => ! i.path.match(/^[_.]/))}))
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

    app.modal(<NewFileModal onCreate={handleFileCreated} />);
  }
  handleDelete() {
    this.setState({file: null});
    this.updateFileList();
  }
  handleClose() {
    this.setState({file: null});
  }
}
