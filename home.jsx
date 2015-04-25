'use strict';

var Home = React.createClass({
  render: function() {
    var user = this.props.user;
    return (
      <div>
        <h1>Reposiories of {user.meta.login}</h1>
      </div>
    );
  }
});

function initializeHomepage(user) {
  React.render(<Home user={user} />, document.querySelector('#top'));
}
