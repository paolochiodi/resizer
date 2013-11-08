var util = require('util');
var process = require("child_process");
var Transform = require('stream').Transform;
var chunker = require('bytechunker');

util.inherits(ResizerStream, Transform);

function ResizerStream(options) {
  if (!(this instanceof ResizerStream))
    return new ResizerStream(options);

  Transform.call(this, options.streamOptions);

  this.options = options;
}

ResizerStream.prototype.before = function() {
  return [];
};

ResizerStream.prototype.parameters = function() {
  return [];
};

ResizerStream.prototype.after = function() {
  return [];
};

ResizerStream.prototype.baseParameter = function() {
  return ['-quality', '91', '+profile', '*', '-auto-orient', '-strip'];
};

ResizerStream.prototype.getParameters = function() {
  return [].concat(this.before())
          .concat('-')
          .concat(this.parameters())
          .concat(this.baseParameter())
          .concat('-')
          .concat(this.after());
};

ResizerStream.prototype.setup = function() {
  if(this._setup)
    return;

  this.inStream = chunker(5120);

  var convert = process.spawn("gm", ["convert"].concat(this.getParameters()), {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  this.inStream.pipe(convert.stdin);
  this.outStream = convert.stdout;

  var resizer = this;
  this.outStream.on('readable', function(data){
    while (null !== (chunk = resizer.outStream.read())) {
      resizer.push(chunk);
    }
  });

  this.outStream.once('end', function() {
    resizer.flushCb();
  });

  convert.on('error', function(err) {
    resizer._error();
  });

  convert.on('exit', function(code) {
    if(code !== 0) {
      resizer._error();
    }
    else {
      resizer.emit('exit');
    }
  });

  this._setup = true;
};

ResizerStream.prototype._error = function() {
  this.emit('error');
};

ResizerStream.prototype._transform = function(chunk, encoding, callback) {
  this.setup();
  this.inStream.write(chunk);
  callback();
};

ResizerStream.prototype._flush = function(callback) {
  this.flushCb = callback;
  this.inStream.end();
};

module.exports = ResizerStream;