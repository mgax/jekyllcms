'use strict';

Q.longStackSupport = true;

function assert(cond) {
  if(! cond) {
    throw "assertion failed";
  }
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function errorHandler(action) {
  return function(e) {
    var message = "Error while " + action;

    if(e.readyState !== null) { // ajax error
      var cause = (e.responseJSON && e.responseJSON.message);
      if(cause) {
        message = message + ": " + cause;
      }
    }

    console.error(message, e, e.stack);
    app.reportError(message);
  }
}

function parseQuery(url) {
  var rv = {};
  if(url.indexOf('?') > -1) {
    url.match(/\?(.*)/)[1].split('&').forEach((pair) => {
      var [k, v] = pair.split('=').map(decodeURIComponent);
      if(! rv[k]) { rv[k] = []; }
      rv[k].push(v);
    });
  }
  return rv;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(text) {
  var romap = {
    'ă': 'a',
    'Ă': 'A',
    'î': 'i',
    'Î': 'I',
    'â': 'a',
    'Â': 'A',
    'ș': 's',
    'Ș': 'S',
    'ş': 's',
    'Ş': 'S',
    'ț': 't',
    'Ț': 'T',
    'ţ': 't',
    'Ţ': 'T',
  };
  return text
    .replace(/[șşțţăîâ]/ig, (ch) => romap[ch])
    .replace(/[^\w\d]+/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '')
    .toLocaleLowerCase();
}

function generateUnique(build, exists) {
  var value = build('');
  if(! exists(value)) { return value; }
  var n = 0;
  while(n < 100) {
    n += 1;
    value = build('-' + n);
    if(! exists(value)) { return value; }
  }
  throw new Error("Counld not generate unique name, stopping at " + value);
}
