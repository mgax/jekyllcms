'use strict';

class IndexFile extends React.Component {
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

class IndexCollection extends React.Component {
  render() {
    var fileList = this.props.fileList
      .filter((file) => file.path.match(/\.(md|markdown|html)$/))
      .sort((a, b) => a.path < b.path ? -1 : 1)
      .map((file) =>
        <IndexFile
          key={file.path}
          file={file}
          onEdit={this.props.onEdit}
          current={file === this.props.current}
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

class SiteContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {collections: extractCollections(props.tree)};
  }
  componentWillReceiveProps(props) {
    this.setState({collections: extractCollections(props.tree)});
  }
  render() {
    var collectionViews = Object.keys(this.state.collections)
      .sort()
      .map((name) =>
        <IndexCollection
          name={name}
          fileList={this.state.collections[name].files}
          onEdit={this.handleEdit.bind(this)}
          />
      );

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
