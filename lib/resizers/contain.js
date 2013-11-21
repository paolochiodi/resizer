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
  else if (options.width) {
    return options.width + 'x' + Math.round(options.width * 768/1024);
  } else {
    return Math.round(options.height * 1024/768) + 'x' + options.height;
  }
}

Contain.prototype.parameters = function() {
  return ['-thumbnail', geometry(this.options)];
};

Contain.prototype.before = function() {
  return ['-size', size(this.options)];
};

module.exports = Contain;