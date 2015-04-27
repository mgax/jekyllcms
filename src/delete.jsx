'use strict';

var DeleteFileModal = React.createClass({
  render: function() {
    return (
      <div className="modal fade">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">Delete file</h4>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <tt>{this.props.path}</tt>?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" data-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-danger" onClick={this.handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
  handleDelete: function() {
    $(React.findDOMNode(this)).modal('hide');
    this.props.onDelete();
  }
});
