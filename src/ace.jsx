'use strict';

var Ace = React.createClass({
  render: function() {
    return <div ref="ace" className="aceContainer" />;
  },
  componentDidMount: function() {
    this.reset(this.props.initial);
  },
  reset: function(content) {
    if(this.ace) { this.ace.destroy(); }
    var node = React.findDOMNode(this.refs.ace);
    $(node).text(content);
    this.ace = ace.edit(node);
    this.ace.getSession().setMode('ace/mode/markdown');
    this.ace.setTheme('ace/theme/github');
    this.ace.setShowPrintMargin(false);
    this.ace.setHighlightActiveLine(false);
    this.ace.on('change', (e) => this.handleChange(e));
  },
  handleChange: function() {
    this.props.onChange(this.ace.getValue());
  }
});
