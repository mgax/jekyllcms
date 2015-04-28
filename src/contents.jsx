'use strict';

var IndexFile = React.createClass({
  render: function() {
    return (
      <li>
        <a onClick={this.handleClick} className="buttonlink">
          {this.props.file.path}
        </a>
      </li>
    );
  },
  handleClick: function(evt) {
    evt.preventDefault();
    this.props.onEdit(this.props.file);
  }
});

var IndexView = React.createClass({
  render: function() {
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
        <IndexFile key={file.path} file={file} onEdit={this.props.onEdit} />
      );
    return (
      <div>
        <ul className="list-unstyled">{fileList}</ul>
        <button
          className="btn btn-default btn-xs"
          onClick={this.handleCreate}
          >new</button>
      </div>
    );
  },
  handleCreate: function(evt) {
    evt.preventDefault();
    this.props.onCreate();
  }
});
