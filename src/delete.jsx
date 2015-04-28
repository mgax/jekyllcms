'use strict';

class DeleteFileModal extends React.Component {
  render() {
    return (
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
          <button
            className="btn btn-danger"
            onClick={this.handleDelete.bind(this)}
            >Delete</button>
        </div>
      </div>
    );
  }
  handleDelete() {
    app.hideModal();
    this.props.onDelete();
  }
}
