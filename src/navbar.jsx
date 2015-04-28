'use strict';

var Navbar = React.createClass({
  render: function() {
    return (
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed"
                    data-toggle="collapse" data-target="#navbar-collapse">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="/">JekyllCMS</a>
          </div>
          <div className="collapse navbar-collapse" id="navbar-collapse">
            <ul className="nav navbar-nav navbar-right">
              <li>
                <a href="https://github.com/mgax/jekyllcms#readme">
                  about
                </a>
              </li>
              <li>
                {this.props.auth ? <LogoutButton /> : null}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    )
  },
});
