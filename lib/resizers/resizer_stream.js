var util = require('util');
var process = require("child_process");
var Transform = require('stream').Transform;
var chunker = require('bytechunker');

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

  var parameters = this.getParameters();
  var convert = process.spawn("gm", ["convert"].concat(parameters), {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  this.inStream.pipe(convert.stdin);
  this.outStream = convert.stdout;

  var resizer = this;
  this.outStream.on('readable', function(data){
    var chunk = null;

    while (null !== (chunk = resizer.outStream.read())) {
      resizer.push(chunk);
    }
  });

  this.outStream.once('end', function() {
    resizer.flushCb();
  });

  convert.on('error', function(err) {
    resizer._error(err);
  });

  convert.on('exit', function(code) {
    clearTimeout(resizer.timeout);
    if(code !== 0) {
      resizer._error('GM process exited with code ' + code.toString() + '\nstderr:\n' + read(convert.stderr));
    }
    else {
      resizer._debug('Resizer completed with message:\n' + read(convert.stderr));
      resizer.emit('exit');
    }
  });

  // prevent stale gm processes
  this.timeout = setTimeout(function() {
    convert.kill('SIGKILL');
  }, this.options.timeout || 10*1000);

  this._setup = true;
  this._debug('Resizer: resizing with ' + parameters.join(' '));
};

ResizerStream.prototype._error = function(message) {
  this.emit('error', message);
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