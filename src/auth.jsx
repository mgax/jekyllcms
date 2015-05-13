'use strict';

class Authorize extends React.Component {
  render() {
    var authUrl = 'https://github.com/login/oauth/authorize' +
      '?client_id=' + encodeURIComponent(app.config.clientId) +
      '&scope=user:email,public_repo' +
      '&redirect_uri=' + encodeURIComponent(app.config.url);
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
        </div>
      </div>
    );
  }
}

class AuthCallback extends React.Component {
  render() {
    return <p>Saving authorization token...</p>;
  }
  componentDidMount() {
    $.get(app.config.gatekeeper + '/authenticate/' + this.props.code, (resp) => {
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
