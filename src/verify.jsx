'use strict';

class EmailNotVerified extends React.Component {
  render() {
    var url = 'https://help.github.com/articles/verifying-your-email-address/';
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close"
                  data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">Verify email</h4>
        </div>
        <div className="modal-body">
          <p>
            Your email address is not verified by GitHub.
            Please <a href={url}>verify it</a>.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-default"
                  data-dismiss="modal">
            Cancel
          </button>
          <button type="button" className="btn btn-primary"
                  onClick={this.handleRetry.bind(this)}>
            Try again
          </button>
        </div>
      </div>
    );
  }
  handleRetry(evt) {
    evt.preventDefault();
    app.hideModal();
    this.props.onRetry();
  }
}
