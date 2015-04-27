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
    var indexFileList = this.props.data
      .filter((file) => file.path.match(/\.(md|html)$/))
      .map((file) =>
        <IndexFile key={file.path} file={file} onEdit={this.props.onEdit} />
      );
    return (
      <div>
        <ul className="list-unstyled">{indexFileList}</ul>
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
