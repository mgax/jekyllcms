'use strict';

class NewRepo extends React.Component {
  render() {
    var newRepoHelp = 'https://help.github.com/articles/create-a-repo/';
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close"
                  data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 className="modal-title">New site</h4>
        </div>
        <div className="modal-body">
          <p>
            To create a new site, first{' '}
            <a href={newRepoHelp} target="_blank">
              create a GitHub repository
            </a>{' '}
            under the <code>{this.props.account.meta.login}</code>{' '}
            {this.props.account.meta.type == 'User' ? 'user' : 'organization'},
            then reload this page.
          </p>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal"
            >Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleReload.bind(this)}
            >Reload</button>
        </div>
      </div>
    );
  }
  handleReload() {
    this.props.onReload();
  }
}
