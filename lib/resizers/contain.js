var util = require('util');
var ResizerStream = require('./resizer_stream');

util.inherits(Contain, ResizerStream);

function Contain(options) {
  if (!(this instanceof Contain))
    return new Contain(options);

  ResizerStream.call(this, options);
}

function geometry(options) {
  if (!options.width) {
    return 'x' + options.height + '>';
  }

  if (!options.height) {
    return options.width + 'x>';
  }

  return options.width + 'x' + options.height + '>';
}

function size(options) {
  if(options.width && options.height) {
    return options.width + 'x' + options.height;
  }
  else {
    return '1024x768';
  }
}

Contain.prototype.parameters = function() {
  return ['-thumbnail', geometry(this.options)];
};

Contain.prototype.before = function() {
  return ['-size', size(this.options)];
};

module.exports = Contain;