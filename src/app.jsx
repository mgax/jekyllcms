'use strict';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: null};
  }
  route() {
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
          var branchName;
          if(query['branch']) {
            branchName = ''+query['branch'];
          }
          else {
            branchName = (
              repo.meta.name == repo.meta.owner.login + '.github.com' ||
              repo.meta.name == repo.meta.owner.login + '.github.io'
                ? 'master'
                : 'gh-pages'
            );
          }
          return <Site repo={repo} branch={repo.branch(branchName)} />;
        })
        .catch(errorHandler("loading repository"));
    }
    else {
      return this.gitHub.user()
        .then((user) => <Home user={user} />)
        .catch(errorHandler("loading user information"));
    }
  }
  componentWillMount() {
    this.config = this.props.config;
    this.route().then((view) =>
      this.setState({view: view}));
  }
  render() {
    return (
      <div>
        <Navbar auth={!! this.authToken} />
        <div className="container">
          {this.state.view}
        </div>
        <div className="modal fade" ref="modal">
          <div className="modal-dialog" ref="modalDialog">
          </div>
        </div>
        <ErrorBox ref="errorBox" />
      </div>
    );
  }
  componentDidMount() {
    $(React.findDOMNode(this.refs.modal)).on('hidden.bs.modal', () => {
      React.unmountComponentAtNode(React.findDOMNode(this.refs.modalDialog));
    });
  }
  modal(component) {
    React.render(component, React.findDOMNode(this.refs.modalDialog));
    $(React.findDOMNode(this.refs.modal)).modal();
  }
  hideModal() {
    $(React.findDOMNode(this.refs.modal)).modal('hide');
  }
  reportError(message) {
    this.refs.errorBox.report(message);
  }
}

$.get('config.json', (config) => {
  window.app = React.render(
    <App config={config} />,
    document.querySelector('body')
  );
});
