'use strict';

class NewFileModal extends React.Component {
  render() {
    return (
      <form className="modal-content" onSubmit={this.handleSubmit.bind(this)}>
        <div className="modal-header">
          <button type="button" className="close"
                  data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">New file</h4>
        </div>
        <div className="modal-body">
          <input className="form-control" placeholder="path" ref="path" />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-default"
                  data-dismiss="modal">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    );
  }
  componentDidMount() {
    setTimeout(() => React.findDOMNode(this.refs.path).focus(), 500);
  }
  handleSubmit(evt) {
    evt.preventDefault();
    var path = React.findDOMNode(this.refs.path).value.trim();
    app.hideModal();
    this.props.onCreate(path);
  }
}
