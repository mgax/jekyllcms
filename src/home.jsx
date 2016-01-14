'use strict';

class Repo extends React.Component {
  render() {
    var Link = ReactRouter.Link;
    var repo = this.props.repo;
    var url = '/' + repo.meta.full_name;
    var query = {};
    if(this.props.demo) {
      query.demo = 'on';
    }
    return (
      <Link className="buttonlink" to={{ pathname: url, query: query}} >
        <h3>{repo.meta.name}</h3>
        <p>{repo.meta.description}</p>
      </Link>
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
      var repoList = (this.state.repoList.length > 0
          ? <ul className="accountRepoList">
              {this.state.repoList.map((repo) =>
                <li key={repo.meta.name}>
                  <Repo repo={repo} demo={this.props.demo} />
                </li>)}
            </ul>
          : <p className="loading">
              No repositories under{' '}
              <code>{this.props.account.meta.login}</code>
            </p>
      );
      return (
        <div>
          <p className="text-right">
            <button
              type="button"
              className="btn btn-default"
              onClick={this.handleNew.bind(this)}
              >new</button>
          </p>
          {repoList}
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

function getUserPromise(demo, userName) {
  var gitHub = GitHub.create(demo);
  if (!gitHub) {
    return Q.reject('not authenticated');
  }
  return gitHub.user(userName)
    .catch((resp) => {
      if(resp.status == 401) {
        localStorage.removeItem('jekyllcms-github-token');``
        window.location.href = '/';
        return Q();
      }
    })
    .catch(errorHandler("loading user information"));
}

class HomeWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    let {query} = this.props.location;
    let {userName} = this.props.params;
    let userPromise = getUserPromise(query.demo, userName);
    return userPromise
      .then((account) => {
        this.setState({
          account: account
        });
      })
      .catch((err) => this.props.history.pushState(null, `/`));
  }
  render() {
    let {query} = this.props.location;
    let {userName} = this.props.params;
    let account = this.state.account;
    if (!account) {
      return false
    }
    if(query.demo) {
      return <Demo demo={userName} account={account} />;
    }
    return <Home user={account} />
  }
}
