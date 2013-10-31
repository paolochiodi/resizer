var util = require('util');
var ResizerStream = require('./resizer_stream');

util.inherits(Crop, ResizerStream);

function Crop(options) {
  if (!(this instanceof Crop))
    return new Crop(options);

  ResizerStream.call(this, options);
}

Crop.prototype.parameters = function() {
  return ['-thumbnail', '100x100^', '-gravity', 'center', '-extent', '100x100'];
};

module.exports = Crop;