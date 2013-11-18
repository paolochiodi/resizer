var util = require('util');
var ResizerStream = require('./resizer_stream');
var funcs = require('../../build/Release/resize');

util.inherits(Crop, ResizerStream);

function Crop(options) {
  if (!(this instanceof Crop))
    return new Crop(options);

  ResizerStream.call(this, options);
}

Crop.prototype.func = function() {
  return funcs.Crop;
};

module.exports = Crop;