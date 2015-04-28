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

    console.error(message, e);
    app.reportError(message);
  }
}
