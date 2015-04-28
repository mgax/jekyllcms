'use strict';

var App = React.createClass({
  route: function() {
    var authMatch = window.location.href.match(/\?code=(.*)/);
    if(authMatch) {
      return Q(<AuthCallback code={authMatch[1]} />);
    }

    this.authToken = localStorage.getItem('jekyllcms-github-token');
    if(! this.authToken) {
      return Q(<AuthButton />);
    }

    this.gitHub = new GitHub(this.authToken);

    var repoMatch = window.location.search.match(/[?&]repo=([^&\/]+\/[^&\/]+)\/?/);
    if(repoMatch) {
      return this.gitHub.repo(repoMatch[1])
        .then((repo) => <Site repo={repo} />)
        .catch(errorHandler("loading repository"));
    }
    else {
      return this.gitHub.user()
        .then((user) => <Home user={user} />)
        .catch(errorHandler("loading user information"));
    }
  },
  componentWillMount: function() {
    this.config = this.props.config;
    this.route().then((view) =>
      this.setState({view: view}));
  },
  getInitialState: function() {
    return {view: null};
  },
  render: function() {
    return (
      <div>
        <div className="container">
          {this.state.view}
        </div>
        <div ref="modal" />
        <ErrorBox ref="errorBox" />
      </div>
    );
  },
  modal: function(component) {
    var node = React.findDOMNode(this.refs.modal);
    React.unmountComponentAtNode(node);
    React.render(component, node);
    $('.modal', node).modal();
  },
  reportError: function(message) {
    this.refs.errorBox.report(message);
  },
});

$.get('config.json', (config) => {
  window.app = React.render(
    <App config={config} />,
    document.querySelector('body')
  );
});
