'use strict';

var Repo = React.createClass({
  render: function() {
    return (
      <a className="buttonlink" href={'/?repo=' + this.props.repo.fullName}>
        {this.props.repo.meta.name}
      </a>
    );
  }
});

var Account = React.createClass({
  render: function() {
    return (
      <a className="buttonlink" onClick={this.handleClick}>
        {this.props.account.meta.login}
      </a>
    );
  },
  handleClick: function(evt) {
    evt.preventDefault();
    this.props.onOpen(this.props.account);
  }
});

var AccountRepos = React.createClass({
  render: function() {
    return (
      <ul>
        {this.state.repoList.map((repo) =>
          <li key={repo.meta.name}><Repo repo={repo} /></li>)}
      </ul>
    );
  },
  getInitialState: function() {
    return {repoList: []};
  },
  componentDidMount: function() {
    this.getRepos(this.props.account);
  },
  componentWillReceiveProps: function(newProps) {
    this.setState({repoList: []});
    this.getRepos(newProps.account);
  },
  getRepos: function(account) {
    account.repos()
      .done((repoList) => {
        repoList.sort((r1, r2) =>
          r1.meta.updated_at > r2.meta.updated_at ? -1 : 1);
        this.setState({repoList: repoList});
      });
  }
});

var Home = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Jekyll CMS</h1>
        <div className="row">
          <ul className="col-sm-6">
            {this.state.accountList.map((acc) =>
              <li key={acc.meta.login}>
                <Account account={acc} onOpen={this.handleOpen} />
              </li>
            )}
          </ul>
          <div className="col-sm-6">
            <AccountRepos account={this.state.account} />
          </div>
        </div>
        <p>{logoutButton()}</p>
      </div>
    );
  },
  getInitialState: function() {
    return {
      accountList: [],
      account: this.props.user,
    };
  },
  componentDidMount: function() {
    this.props.user.orgs()
      .done((accountList) => {
        this.setState({accountList: [this.props.user].concat(accountList)});
      });
  },
  handleOpen: function(account) {
    this.setState({account: account});
  }
});

function initializeHomepage(user) {
  React.render(<Home user={user} />, document.querySelector('#top'));
}
