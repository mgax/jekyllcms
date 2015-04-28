'use strict';

var App = React.createClass({
  route: function() {
    var query = parseQuery(window.location.search);

    if(query['code']) {
      return Q(<AuthCallback code={''+query['code']} />);
    }

    this.authToken = localStorage.getItem('jekyllcms-github-token');
    if(! this.authToken) {
      return Q(<Authorize />);
    }

    this.gitHub = new GitHub(this.authToken);

    if(query['repo']) {
      return this.gitHub.repo(''+query['repo'])
        .then((repo) => {
          var branch = repo.branch(
            repo.meta.name == repo.meta.owner.login + '.github.com' ||
            repo.meta.name == repo.meta.owner.login + '.github.io'
              ? 'master'
              : 'gh-pages'
          );
          return <Site repo={repo} branch={branch} />;
        })
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
        <Navbar auth={!! this.authToken} />
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
