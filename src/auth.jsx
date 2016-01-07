'use strict';

class Authorize extends React.Component {
  constructor(props) {
    super(props);
    this.state = {demo: false};
  }
  render() {
    var authUrl = 'https://github.com/login/oauth/authorize' +
      '?client_id=' + encodeURIComponent(__app_config.clientId) +
      '&scope=user:email,public_repo' +
      '&redirect_uri=' + encodeURIComponent(__app_config.url);
    return (
      <div className="row">
        <div className="col-sm-4 col-sm-offset-4 well authbox">
          <p>
            JekyllCMS is a content editor
            for <a href="https://pages.github.com/">GitHub Pages</a> websites.
          </p>
          <p>
            <a href="https://github.com/mgax/jekyllcms#readme">
              <strong>Learn more</strong>
            </a>
          </p>
          <p>
            <a className="btn btn-success" href={authUrl}>
              Authorize on GitHub
            </a>
          </p>
          <p>
            Or enter <a onClick={this.handleDemo.bind(this)} href="#">demo mode</a>,
            which requires no authorization, but is read-only.
          </p>
          {this.state.demo ?
            <form className="form-inline" onSubmit={this.handleBrowse.bind(this)}>
              <input
                placeholder="Account name ..." ref="account"
                className="form-control"
                autoFocus />
              <button type="submit" className="btn btn-primary">
                browse
              </button>
            </form>
          : ''}
        </div>
      </div>
    );
  }
  handleDemo(evt) {
    evt.preventDefault();
    this.setState({demo: true});
  }
  handleBrowse(evt) {
    evt.preventDefault();
    var login = React.findDOMNode(this.refs.account).value;
    window.location.href = '/' + encodeURIComponent(login) + '?demo=on';
  }
}

class AuthCallback extends React.Component {
  render() {
    return <p>Saving authorization token...</p>;
  }
  componentDidMount() {
    $.get(__app_config.gatekeeper + '/authenticate/' + this.props.code, (resp) => {
      if(resp.token) {
        localStorage.setItem('jekyllcms-github-token', resp.token);
        window.location.href = '/';
      }
    });
  }
}

class LogoutButton extends React.Component {
  render() {
    return (
      <button
        className="btn btn-default navbar-btn"
        onClick={this.handleClick.bind(this)}
        >logout</button>
    );
  }
  handleClick() {
    localStorage.removeItem('jekyllcms-github-token');
    window.location.href = '/';
  }
}
