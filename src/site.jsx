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
      editor = <Editor
        file={this.state.file}
        onDelete={this.updateFileList}
        />;
    }
    return (
      <div className="row">
        <div id="index" className="col-sm-2">
          <IndexView
            data={this.state.fileList}
            onEdit={this.handleEdit}
            onCreate={this.handleCreate}
            />
        </div>
        <div id="src" className="col-sm-10">
          {editor}
        </div>
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
  }
});

function initializeSite(repo) {
  React.render(<Site repo={repo} />, document.querySelector('#top'));
}
