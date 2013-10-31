var util = require('util');
var ResizerStream = require('./resizer_stream');

util.inherits(Cover, ResizerStream);

function Cover(options) {
  if (!(this instanceof Cover))
    return new Cover(options);

  ResizerStream.call(this, options);
}

function geometry(options) {
  return options.width + 'x' + options.height + '^';
}


Cover.prototype.parameters = function() {
  return ['-thumbnail', geometry(this.options), '-gravity', 'center', '-extent', geometry(this.options)];
};

module.exports = Cover;