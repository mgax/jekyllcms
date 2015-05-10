'use strict';

function permalinkVars(path, colName) {
    if(colName == 'posts') {
      var m = path.match(/^_posts\/(\d{4})-(\d{2})-(\d{2})-(.+)\.[^\.]+$/);
      if(m) {
        var year = m[1];
        var month = m[2];
        var day = m[3];
        var title = m[4];
        return {
          year: year,
          month: month,
          i_month: +month,
          day: day,
          i_day: +day,
          short_year: year.slice(2),
          title: title,
          categories: '',
          output_ext: '.html',
        };
      }
    }
    else {
      var m = path.match(/^(.*\/)?([^\/]*)\.[^\.]+$/);
      return {
        path: m[1] || '',
        basename: m[2],
        output_ext: '.html',
      };
    }
}

class File {
  constructor(ghFile, collection) {
    this.ghFile = ghFile;
    this.path = ghFile.path;
    this.collection = collection;
    this.permalinkVars = permalinkVars(this.path, collection.name);
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

  permalink() {
    return this.collection.permalink(this);
  }

  url() {
    return this.state.siteUrl + '/' + this.url();
  }
}

class Collection {
  constructor(name, permalinkTemplate) {
    this.name = name;
    this.permalinkTemplate = permalinkTemplate;
    this.files = [];
  }

  permalink(file) {
    return this.permalinkTemplate
      .replace(/:(\w+)/g, (_, name) => file.permalinkVars[name] || '')
      .replace(/\/{2,}/g, '/')
      .replace(/\/index.html$/, '/');
  }

  permalinkForPath(path) {
    var fakeFile = new File({path: path}, this);
    return this.permalink(fakeFile);
  }
}
