'use strict';

class Ace extends React.Component {
  render() {
    return <div ref="ace" className="aceContainer" />;
  }
  componentDidMount() {
    this.reset(this.props.initial);
  }
  reset(content) {
    if(this.ace) { this.ace.destroy(); }
    var node = React.findDOMNode(this.refs.ace);
    $(node).text(content);
    this.ace = ace.edit(node);
    this.ace.getSession().setMode('ace/mode/markdown');
    this.ace.setTheme('ace/theme/github');
    this.ace.setShowPrintMargin(false);
    this.ace.setHighlightActiveLine(false);
    this.ace.on('change', (e) => this.handleChange(e));
  }
  handleChange() {
    this.props.onChange(this.ace.getValue());
  }
}
