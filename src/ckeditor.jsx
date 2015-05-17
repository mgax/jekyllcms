'use strict';

class CKEditor extends React.Component {
  render() {
    return <textarea ref="ck" className="ckeditorContainer" />;
  }
  componentDidMount() {
    this.reset(this.props.initial);
  }
  componentWillUnmount() {
    if(this.ck) { this.ck.destroy(); }
  }
  getSiteUrl() {
    return 'http://' + this.props.config.siteUrl;
  }
  toHtml(source) {
    return (source
      .split(/{{\s*site\.base_url\s*}}/)
      .join(this.getSiteUrl())
    );
  }
  fromHtml(html) {
    return (html
      .split(this.getSiteUrl())
      .join('{{ site.base_url }}')
    );
  }
  reset(content) {
    if(this.ck) { this.ck.destroy(); }
    var node = React.findDOMNode(this.refs.ck);
    $(node).text(this.toHtml(content));

    var options = {
      allowedContent: true,
      toolbar: [
        {name: 'styles', items: ['Format']},
        {name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike']},
        {name: 'paragraph', items: ['NumberedList', 'BulletedList', 'Indent', 'Outdent', '-', 'Blockquote']},
        {name: 'table', items: ['Table']},
        {name: 'links', items: ['Link', 'Unlink', '-', 'Anchor']},
        {name: 'subsuper', items: ['Subscript', 'Superscript']},
        {name: 'colors', items: ['TextColor', 'BGColor']},
        {name: 'tools', items: ['SpecialChar', '-', 'RemoveFormat', 'Maximize', '-', 'Source']}
      ]
    };
    this.ck = CKEDITOR.replace(node, options);
    this.ck.on('change', () => this.handleChange());
  }
  handleChange() {
    this.props.onChange(this.fromHtml(this.ck.getData()));
  }
}
