'use strict';

class NewSiteModal extends React.Component {
  render() {
    return (
      <form className="modal-content" onSubmit={this.handleSubmit.bind(this)}>
        <div className="modal-header">
          <button type="button" className="close"
                  data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">New site</h4>
        </div>
        <div className="modal-body">
          <p>
            There seems to be no GitHub Pages website in this repository. Let's
            create one! Pick a title.
          </p>
          <div className="form-group">
            <input
              className="form-control"
              placeholder="title"
              ref="title"
              defaultValue="Beautiful new website"
              />
          </div>
          <p>
            Technical details: we're going to create a branch
            named <code>{this.props.branchName}</code> and put a sample Jekyll
            website in it.
          </p>
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
    setTimeout(() => React.findDOMNode(this.refs.title).select(), 500);
  }
  handleSubmit(evt) {
    evt.preventDefault();
    var title = React.findDOMNode(this.refs.title).value.trim();
    app.hideModal();
    this.props.onCreate({title: title});
  }
}
