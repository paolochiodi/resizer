var util = require('util');
var Transform = require('stream').Transform;

util.inherits(ResizerStream, Transform);

function read(stream) {
  var message = '',
      chunk;

  while (null !== (chunk = stream.read())) {
    message += chunk;
  }

  return message;
}

function ResizerStream(options) {
  if (!(this instanceof ResizerStream))
    return new ResizerStream(options);

  Transform.call(this, options.streamOptions);

  this.options = options;

  this._debug = options.debug || (function() {});
}

ResizerStream.prototype.setup = function() {
  if(this._setup)
    return;

  this._bufs = [];
  this._setup = true;
};

ResizerStream.prototype.resize = function() {
  var buf =  Buffer.concat(this._bufs);
  var resizer = this;

  this.func()(buf, this.options, function(image) {
    resizer.push(image);
    resizer.emit('exit');
    resizer.flushCb();
  });
};

ResizerStream.prototype._transform = function(chunk, encoding, callback) {
  this.setup();
  this._bufs.push(chunk);
  callback();
};

ResizerStream.prototype._flush = function(callback) {
  this.flushCb = callback;
  this.resize();
};

module.exports = ResizerStream;