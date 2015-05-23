'use strict';

class Demo extends React.Component {
  render() {
    var account = this.props.account;
    return (
      <div>
        <h1>{account.meta.login} repositories</h1>
        <AccountRepos account={account} demo={this.props.demo} />
      </div>
    );
  }
}
