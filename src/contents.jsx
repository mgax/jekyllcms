'use strict';

class IndexFile extends React.Component {
  render() {
    return (
      <li className={this.props.current ? 'current' : null}>
        <a onClick={this.handleClick.bind(this)} className="buttonlink">
          {this.props.file.path}
        </a>
      </li>
    );
  }
  handleClick(evt) {
    evt.preventDefault();
    this.props.onEdit(this.props.file);
  }
}

class IndexView extends React.Component {
  render() {
    if(! this.props.fileList) {
      return (
        <p className="loading">
          Loading <i className="fa fa-cog fa-spin" />
        </p>
      );
    }

    var fileList = this.props.fileList
      .filter((file) => file.path.match(/\.(md|markdown|html)$/))
      .sort((a, b) => a.path < b.path ? -1 : 1)
      .map((file) =>
        <IndexFile
          key={file.path}
          file={file}
          onEdit={this.props.onEdit.bind(this)}
          current={file === this.props.current}
          />
      );
    return (
      <div>
        <ul className="fileList">{fileList}</ul>
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
