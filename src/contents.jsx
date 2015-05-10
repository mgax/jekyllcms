'use strict';

class FileView extends React.Component {
  render() {
    var cls = ['file'];
    if(this.props.current) { cls.push('current'); }
    if(! this.props.file.isSaved()) { cls.push('new'); }
    return (
      <li className={cls.join(' ')}>
        <a
          onClick={this.handleClick.bind(this)}
          className="buttonlink"
          title={this.props.file.path}
          >{this.props.file.permalink()}</a>
      </li>
    );
  }
  handleClick(evt) {
    evt.preventDefault();
    this.props.onEdit(this.props.file);
  }
}

class CollectionView extends React.Component {
  render() {
    var fileList = this.props.fileList
      .filter((file) => file.path.match(/\.(md|markdown|html)$/))
      .sort((a, b) => a.path < b.path ? -1 : 1)
      .map((file) =>
        <FileView
          key={file.path}
          file={file}
          onEdit={this.props.onEdit}
          current={file === this.props.currentFile}
          />
      );
    return (
      <div>
        <h3>{this.props.name}</h3>
        <ul className="fileList">{fileList}</ul>
      </div>
    );
  }
}

function extractCollections(tree, config) {
  var collections = {
    posts: new Collection('posts', config.permalinkTemplate('posts')),
    pages: new Collection('pages', config.permalinkTemplate('pages')),
  };

  tree.forEach((ghFile) => {
    var col = null;
    if(ghFile.path.match(/^_posts\//)) {
      col = collections.posts;
    }
    else if(ghFile.path.match(/^[^_.]/)) {
      col = collections.pages;
    }

    if(col) {
      col.files.push(new File(ghFile, col));
    }
  });

  return collections;
}

class SiteContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {collections: extractCollections(props.tree, props.config)};
  }
  componentWillReceiveProps(props) {
    this.setState({collections: extractCollections(props.tree, props.config)});
  }
  render() {
    var collectionViews = Object.keys(this.state.collections)
      .sort()
      .map((name) =>
        <CollectionView
          name={name}
          fileList={this.state.collections[name].files}
          onEdit={this.handleEdit.bind(this)}
          currentFile={this.state.currentFile}
          />
      );

    var editor = null;
    if(this.state.currentFile) {
      editor = (
        <div className="editor-container row">
          <div className="editor col-sm-offset-2 col-sm-10">
            <Editor
              file={this.state.currentFile}
              onDelete={this.handleDelete.bind(this)}
              onClose={this.handleClose.bind(this)}
              config={this.props.config}
              />
          </div>
        </div>
      );
    }

    return (
      <div>
        {collectionViews}
        <button
          className="btn btn-default btn-xs"
          onClick={this.handleCreate.bind(this)}
          >new</button>
        {editor}
      </div>
    );
  }
  handleEdit(file) {
    this.setState({currentFile: file});
  }
  handleCreate() {
    console.error('FIXME fileList -> collections'); return;
    var handleFileCreated = (path) => {
      var file = new File(this.state.branch.newFile(path));
      this.setState({
        currentFile: file,
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
        config={this.props.config}
        />
    );
  }
  handleDelete() {
    this.setState({currentFile: null});
    this.props.onTreeChange();
  }
  handleClose() {
    this.setState({currentFile: null});
  }
}
