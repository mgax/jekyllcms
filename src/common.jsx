'use strict';

Q.longStackSupport = true;

function assert(cond) {
  if(! cond) {
    throw "assertion failed";
  }
}

function modal(component) {
  var node = document.querySelector('#modal');
  React.unmountComponentAtNode(node);
  React.render(component, node);
  $('.modal', node).modal();
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}
