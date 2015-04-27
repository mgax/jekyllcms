'use strict';

var Repo = React.createClass({
  render: function() {
    var repo = this.props.repo;
    return (
      <a className="buttonlink" href={'/?repo=' + repo.meta.full_name}>
        <h3>{repo.meta.name}</h3>
        <p>{repo.meta.description}</p>
      </a>
    );
  }
});

var Account = React.createClass({
  render: function() {
    var account = this.props.account;
    var caret = null;
    if(this.props.selected) {
      caret = <div className="accountSelectedMarker">&raquo;</div>;
    }
    return (
      <a className='buttonlink' onClick={this.handleClick}>
        <img src={account.meta.avatar_url} />
        {caret}
        <p>{account.meta.login}</p>
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
      <ul className="accountRepoList">
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
      .then((repoList) => {
        repoList.sort((r1, r2) =>
          r1.meta.updated_at > r2.meta.updated_at ? -1 : 1);
        this.setState({repoList: repoList});
      })
      .catch(errorHandler("loading repository list"));
  }
});

var Home = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Jekyll CMS</h1>
        <div className="row">
          <ul className="accountList col-sm-4">
            {this.state.accountList.map((acc) =>
              <li key={acc.meta.login}>
                <Account
                  account={acc}
                  selected={acc == this.state.account}
                  onOpen={this.handleOpen}
                  />
              </li>
            )}
          </ul>
          <div className="col-sm-8">
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
      .then((accountList) => {
        this.setState({accountList: [this.props.user].concat(accountList)});
      })
      .catch(errorHandler("loading organization list"));
  },
  handleOpen: function(account) {
    this.setState({account: account});
  }
});

function initializeHomepage(user) {
  React.render(<Home user={user} />, document.querySelector('#top'));
}
