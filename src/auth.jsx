'use strict';

var AuthButton = React.createClass({
  render: function() {
    var authUrl = 'https://github.com/login/oauth/authorize' +
      '?client_id=' + encodeURIComponent(app.config.clientId) +
      '&scope=repo' +
      '&redirect_uri=' + encodeURIComponent(app.config.url);
    return <a className="btn btn-success" href={authUrl}>authorize</a>;
  }
});

var AuthCallback = React.createClass({
  render: function() {
    return <p>Saving authorization token...</p>;
  },
  componentDidMount: function() {
    $.get(app.config.gatekeeper + '/authenticate/' + this.props.code, (resp) => {
      if(resp.token) {
        localStorage.setItem('jekyllcms-github-token', resp.token);
        window.location.href = '/';
      }
    });
  }
});

var LogoutButton = React.createClass({
  render: function() {
    return (
      <button
        className="btn btn-default navbar-btn"
        onClick={this.handleClick}
        >logout</button>
    );
  },
  handleClick: function() {
    localStorage.removeItem('jekyllcms-github-token');
    window.location.href = '/';
  }
});
