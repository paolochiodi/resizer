var util = require('util');
var ResizerStream = require('./resizer_stream');
var funcs = require('../../build/Release/resize');

util.inherits(Contain, ResizerStream);

function Contain(options) {
  if (!(this instanceof Contain))
    return new Contain(options);

  ResizerStream.call(this, options);
}

Contain.prototype.func = function() {
  return funcs.Contain;
};

module.exports = Contain;