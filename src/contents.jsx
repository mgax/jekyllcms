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

class IndexView extends React.Component {
  render() {
    var collections = this.props.collections;

    if(! collections) {
      return (
        <p className="loading">
          Loading <i className="fa fa-cog fa-spin" />
        </p>
      );
    }

    var collectionViews = Object.keys(collections)
      .sort()
      .map((name) =>
        <IndexCollection
          name={name}
          fileList={collections[name].files}
          onEdit={this.props.onEdit}
          />
      );

    return (
      <div>
        {collectionViews}
        <button
          className="btn btn-default btn-xs"
          onClick={this.handleCreate.bind(this)}
          >new</button>
      </div>
    );
  }
  handleCreate(evt) {
    evt.preventDefault();
    this.props.onCreate();
  }
}
