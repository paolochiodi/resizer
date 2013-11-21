var util = require('util');
var ResizerStream = require('./resizer_stream');

util.inherits(Crop, ResizerStream);

function Crop(options) {
  if (!(this instanceof Crop))
    return new Crop(options);

  ResizerStream.call(this, options);
}

function geometry(options) {
  return options.width + 'x' + options.height + '>';
}

Crop.prototype.parameters = function() {
  return ['-gravity', 'center', '-extent', geometry(this.options), '-thumbnail', geometry(this.options)];
};

module.exports = Crop;