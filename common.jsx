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
