'use strict';

class File {
  constructor(ghFile) {
    this.ghFile = ghFile;
    this.path = ghFile.path;
  }

  isSaved() {
    return !! this.ghFile.sha;
  }

  content() {
    return this.ghFile.content();
  }

  save(newContent) {
    return this.ghFile.save(newContent);
  }

  delete() {
    return this.ghFile.delete();
  }
}
