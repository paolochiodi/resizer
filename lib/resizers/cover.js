var util = require('util');
var ResizerStream = require('./resizer_stream');
var funcs = require('../../build/Release/resize');

util.inherits(Cover, ResizerStream);

function Cover(options) {
  if (!(this instanceof Cover))
    return new Cover(options);

  ResizerStream.call(this, options);
}

Cover.prototype.func = function() {
  return funcs.Cover;
};

module.exports = Cover;