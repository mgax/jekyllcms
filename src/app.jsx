'use strict';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: null};
  }
  componentWillMount() {
    window.app = this;
  }
  render() {
    var view = this.props.children;
    let { query } = this.props.location;

    if(query.code) {
        view = <AuthCallback code={''+query['code']} />;
    } else {
      this.authToken = localStorage.getItem('jekyllcms-github-token');
      if(!this.authToken & !query.demo){
          view = <Authorize />;
      }
    }

    if (!view) {
      let github = GitHub.create();
      if (github) {
        github.authenticatedUserLogin().then((userName) => {
          this.props.history.pushState(null, '/' + userName);
        });
      }
    }

    return (
      <div>
        <div>
          <Navbar auth={!! this.authToken} />
          <div className="container">
            {view}
          </div>
          <div className="modal fade" ref="modal">
            <div className="modal-dialog" ref="modalDialog">
            </div>
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
  let Router = ReactRouter.Router,
    Route = ReactRouter.Route, browserHistory = ReactRouter.browserHistory

  var query = parseQuery(window.location.search);
  if(config.piwik && ! query['code']) {
    trackPiwik(config.piwik);
  }
  window.__app_config = config;
  React.render(
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <Route path=":userName" component={HomeWrapper}/>
        <Route path=":userName/:repoName" component={SiteWrapper}/>
      </Route>
      <Route path="/:userName/:repoName/ckImageBrowser" component={CKImageBrowserWrapper}/>
    </Router>,
    document.querySelector('body')
  );
});
