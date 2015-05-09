'use strict';

class IndexFile extends React.Component {
  render() {
    var cls = [];
    if(this.props.current) { cls.push('current'); }
    if(! this.props.file.sha) { cls.push('new'); }
    return (
      <li className={cls.join(' ')}>
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
    if(! this.props.fileList) {
      return (
        <p className="loading">
          Loading <i className="fa fa-cog fa-spin" />
        </p>
      );
    }

    return (
      <div>
        <IndexCollection
          name="pages"
          fileList={this.props.fileList}
          onEdit={this.props.onEdit}
          />
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
