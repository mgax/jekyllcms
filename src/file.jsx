'use strict';

function slugForPath(path) {
  var m = path.match(/^(.*\/)?([^\/]*)\.[^\.]+$/);
  var filename = (m[2] == 'index') ? '' : m[2];
  var folder = m[1] || '';
  return '/' + folder + filename;
}

class File {
  constructor(ghFile) {
    this.ghFile = ghFile;
    this.path = ghFile.path;
  }

  isSaved() {
    return !! this.ghFile.sha;
  }

  load() {
    function parse(src) {
      var lines = src.split(/\n/);
      var frontMatterStart = lines.indexOf('---');
      if(frontMatterStart != 0) {
        return {
          frontMatter: {},
          content: src
        }
      }
      var frontMatterEnd = lines.indexOf('---', frontMatterStart + 1);
      assert(frontMatterEnd > -1);
      return {
        frontMatter: jsyaml.safeLoad(
          lines.slice(frontMatterStart + 1, frontMatterEnd).join('\n') + '\n'
        ),
        content: lines.slice(frontMatterEnd + 1).join('\n')
      }
    }

    return this.ghFile.getContent()
      .then((content) => parse(decode_utf8(content)));
  }

  save(data) {
    var content = encode_utf8(
      '---\n' +
      jsyaml.safeDump(data.frontMatter) +
      '---\n' +
      data.content
    );
    return this.ghFile.putContent(content);
  }

  delete() {
    return this.ghFile.delete();
  }

  slug() {
    return slugForPath(this.path);
  }

  url() {
    return this.state.siteUrl + '/' + this.url();
  }
}
