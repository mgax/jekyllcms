'use strict';

function matchPath(path, colName) {
    if(path.match(/\/[_.]/)) {
      // ignore paths that contain a non-root item that start with [_.]
      return;
    }

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
      return;
    }

    if(colName == 'pages') {
      if(path.match(/^[_.]/)) {
        // ignore paths whose root item starts with [_.]
        return;
      }

      var m = path.match(/^(.*\/)?([^\/]*)\.[^\.]+$/);
      if(m) {
        return {
          path: m[1] || '',
          basename: m[2],
          output_ext: '.html',
        };
      }
      return;
    }
}

class File {
  constructor(ghFile, collection, permalinkVars) {
    this.ghFile = ghFile;
    this.path = ghFile.path;
    this.collection = collection;
    this.permalinkVars = permalinkVars;
  }

  isNew() {
    return ! this.ghFile.sha;
  }

  load() {
    function parse(src) {
      var lines = src.split(/\n/);
      var frontMatterStart = lines.indexOf('---');
      if(frontMatterStart != 0) {
        return {
          frontMatter: null,
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

    var getContent = (this.isNew()
      ? Q(encode_utf8(`---\ntitle: ${JSON.stringify(this.initialTitle)}\n---\n`))
      : this.ghFile.getContent());
    return getContent
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

  permalink(extensionless) {
    var rv = this.collection.permalinkTemplate
      .replace(/:(\w+)/g, (_, name) => this.permalinkVars[name] || '')
      .replace(/\/{2,}/g, '/')
      .replace(/\/index.html$/, '/');
    if(extensionless) {
      rv = rv.replace(/\.html$/, '');
    }
    return rv;
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

  match(ghFile, errorOnFailure) {
    var permalinkVars = matchPath(ghFile.path, this.name);
    if(permalinkVars) {
      return new File(ghFile, this, permalinkVars);
    }
    else if(errorOnFailure) {
      throw new Error("Invalid path for " + this.name + ": " + ghFile.path);
    }
  }
}
