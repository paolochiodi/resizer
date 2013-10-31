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
    return options.width + '>';
  }

  return options.width + 'x' + options.height + '>';
}

Contain.prototype.parameters = function() {
  console.log('contain', ["-size", geometry(this.options), "-thumbnail", geometry(this.options)]);

  return ["-size", geometry(this.options), "-thumbnail", geometry(this.options)];
};

module.exports = Contain;