'use strict';

class NewFileModal extends React.Component {
  render() {
    return (
      <div className="modal fade">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">New file</h4>
            </div>
            <div className="modal-body">
              <input className="form-control" placeholder="path" ref="path" />
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" data-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={this.handleCreate.bind(this)}
                >Create</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  handleCreate() {
    var path = React.findDOMNode(this.refs.path).value.trim();
    $(React.findDOMNode(this)).modal('hide');
    this.props.onCreate(path);
  }
}
