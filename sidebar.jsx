'use strict';

var IndexFile = React.createClass({
  render: function() {
    return <li><a onClick={this.handleClick}>{this.props.file.path}</a></li>;
  },
  handleClick: function(evt) {
    evt.preventDefault();
    this.props.onEdit(this.props.file);
  }
});

var IndexView = React.createClass({
  render: function() {
    var indexFileList = this.props.data.map((file) =>
      <IndexFile file={file} onEdit={this.props.onEdit} />
    );
    return <ul className="list-unstyled">{indexFileList}</ul>;
  }
});
