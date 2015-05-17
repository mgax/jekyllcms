'use strict';

class FileView extends React.Component {
  render() {
    var cls = ['file'];
    if(this.props.current) { cls.push('current'); }
    if(this.props.file.isNew()) { cls.push('new'); }
    return (
      <li className={cls.join(' ')}>
        <a
          onClick={this.handleClick.bind(this)}
          className="buttonlink"
          title={this.props.file.path}
          >{this.props.file.permalink(true)}</a>
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
    var fileViews = this.props.collection.files
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
        <h3>
          {this.props.name}{' '}
          <div className="btn-group btn-group-xs" role="group">
            <button
              type="button"
              className="btn btn-default"
              onClick={this.handleCreateDialog.bind(this)}
              ><i className="fa fa-plus"></i></button>
          </div>
        </h3>
        <ul className="fileList">{fileViews}</ul>
      </div>
    );
  }
  handleCreateDialog() {
    app.modal(
      <NewFileModal
        onCreate={(options) => this.props.onCreate(options, this.props.collection)}
        pathExists={this.props.pathExists}
        config={this.props.config}
        collection={this.props.collection}
        />
    );
  }
}

function extractCollections(tree, config) {
  var collections = {};
  var colList = ['posts', 'pages'].map((name) => {
    var col = new Collection(name, config.permalinkTemplate(name));
    collections[col.name] = col;
    return col;
  });

  tree.forEach((ghFile) => {
    for(var i = 0; i < colList.length; i ++) {
      var col = colList[i];
      var file = col.match(ghFile);
      if(file) {
        col.files.push(file);
        break;
      }
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
          key={name}
          collection={this.state.collections[name]}
          currentFile={this.state.currentFile}
          pathExists={this.pathExists.bind(this)}
          onCreate={this.handleCreate.bind(this)}
          onEdit={this.handleEdit.bind(this)}
          config={this.props.config}
          />
      );

    var editor = null;
    if(this.state.currentFile) {
      editor = (
        <div className="editor-container row">
          <div className="editor col-sm-offset-2 col-sm-10">
            <Editor
              ref="editor"
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
        {editor}
      </div>
    );
  }
  pathExists(path) {
    var matching = this.props.tree.filter((f) => f.path == path);
    return matching.length > 0;
  }
  handleCreate(options, collection) {
    var file = collection.match(this.props.createFile(options.path), true);
    file.initialTitle = options.title;
    this.setState({currentFile: file});
  }
  handleEdit(file) {
    this.setState({currentFile: file});
  }
  handleDelete() {
    this.setState({currentFile: null});
    this.props.onTreeChange();
  }
  handleClose() {
    this.setState({currentFile: null});
  }
}
