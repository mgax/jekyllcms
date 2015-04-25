'use strict';

var Home = React.createClass({
  render: function() {
    var user = this.props.user;
    var repoList = this.state.repoList;
    return (
      <div>
        <h1>Reposiories of {user.meta.login}</h1>
        <ul>
          {repoList.map((repo) => <li>{repo.fullName}</li>)}
        </ul>
      </div>
    );
  },
  getInitialState: function() {
    return {repoList: []};
  },
  componentDidMount: function() {
    this.props.user.repos()
      .done((repoList) => {
        this.setState({repoList: repoList});
      });
  }
});

function initializeHomepage(user) {
  React.render(<Home user={user} />, document.querySelector('#top'));
}
