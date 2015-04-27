'use strict';

var Site = React.createClass({
  getInitialState: function() {
    return {
      fileList: []
    };
  },
  render: function() {
    var editor = null;
    if(this.state.file) {
      editor = (
        <div className="editor-container row">
          <div className="editor col-sm-offset-2 col-sm-10">
            <Editor
              file={this.state.file}
              onDelete={this.handleDelete}
              onClose={this.handleClose}
              />
          </div>
        </div>
      );
    }
    return (
      <div className="site">
        <h1>{this.props.repo.meta.full_name}</h1>
        <IndexView
          data={this.state.fileList}
          onEdit={this.handleEdit}
          onCreate={this.handleCreate}
          />
        {editor}
      </div>
    );
  },
  componentDidMount: function() {
    this.updateFileList();
  },
  updateFileList: function() {
    this.props.repo.files().done((tree) => {
      this.setState({fileList: tree.filter((i) => ! i.path.match(/^[_.]/))});
    });
  },
  handleEdit: function(file) {
    this.setState({file: file});
  },
  handleCreate: function() {
    var handleFileCreated = (path) => {
      var newFile = this.props.repo.newFile(path);
      this.setState({
        file: newFile,
        fileList: [].concat(this.state.fileList, [newFile]),
      });
    };

    modal(<NewFileModal onCreate={handleFileCreated} />);
  },
  handleDelete: function() {
    this.setState({file: null});
    this.updateFileList();
  },
  handleClose: function() {
    this.setState({file: null});
  }
});

function initializeSite(repo) {
  React.render(<Site repo={repo} />, document.querySelector('#top'));
}
