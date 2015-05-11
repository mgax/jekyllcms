'use strict';

class Repo extends React.Component {
  render() {
    var repo = this.props.repo;
    return (
      <a className="buttonlink" href={'/?repo=' + repo.meta.full_name}>
        <h3>{repo.meta.name}</h3>
        <p>{repo.meta.description}</p>
      </a>
    );
  }
}

class Account extends React.Component {
  render() {
    var account = this.props.account;
    var caret = null;
    if(this.props.selected) {
      caret = <div className="accountSelectedMarker">&raquo;</div>;
    }
    return (
      <a className='buttonlink' onClick={this.handleClick.bind(this)}>
        <img src={account.meta.avatar_url} />
        {caret}
        <p>{account.meta.login}</p>
      </a>
    );
  }
  handleClick(evt) {
    evt.preventDefault();
    this.props.onOpen(this.props.account);
  }
}

class AccountRepos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {repoList: null};
  }
  render() {
    if(this.state.repoList) {
      return (
        <div>
          <p className="text-right">
            <button
              type="button"
              className="btn btn-default"
              onClick={this.handleNew.bind(this)}
              >new</button>
          </p>
          <ul className="accountRepoList">
            {this.state.repoList.map((repo) =>
              <li key={repo.meta.name}><Repo repo={repo} /></li>)}
          </ul>
        </div>
      );
    }
    else {
      return (
        <p className="loading">
          Loading <i className="fa fa-cog fa-spin" />
        </p>
      );
    }
  }
  componentDidMount() {
    this.getRepos(this.props.account);
  }
  componentWillReceiveProps(newProps) {
    this.setState({repoList: null});
    this.getRepos(newProps.account);
  }
  getRepos(account) {
    account.repos()
      .then((repoList) => {
        repoList.sort((r1, r2) =>
          r1.meta.updated_at > r2.meta.updated_at ? -1 : 1);
        this.setState({repoList: repoList});
      })
      .catch(errorHandler("loading repository list"));
  }
  handleNew(evt) {
    app.modal(
      <NewRepo
        account={this.props.account}
        onReload={() => window.location.reload()}
        />
    );
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accountList: [],
      account: this.props.user,
    };
  }
  render() {
    return (
      <div>
        <div className="row">
          <ul className="accountList col-sm-4">
            {this.state.accountList.map((acc) =>
              <li key={acc.meta.login}>
                <Account
                  account={acc}
                  selected={acc == this.state.account}
                  onOpen={this.handleOpen.bind(this)}
                  />
              </li>
            )}
          </ul>
          <div className="col-sm-8">
            <AccountRepos account={this.state.account} />
          </div>
        </div>
      </div>
    );
  }
  componentDidMount() {
    this.props.user.orgs()
      .then((accountList) => {
        this.setState({accountList: [this.props.user].concat(accountList)});
      })
      .catch(errorHandler("loading organization list"));
  }
  handleOpen(account) {
    this.setState({account: account});
  }
}
