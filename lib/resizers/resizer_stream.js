var util = require('util');
var process = require("child_process");
var Duplex = require('stream').Duplex;
var chunker = require('bytechunker');

util.inherits(ResizerStream, Duplex);

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

  Duplex.call(this, {  });
  this.allowHalfOpen = true;

  this.options = options;
  this._debug = options.debug || (function() { });
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

ResizerStream.prototype.baseParameters = function() {
  var output = '-';

  if(this.options.convertTo) {
    output = this.options.convertTo + ':-';
  }

  return ['-quality', '91', '+profile', '*', '-auto-orient', '-strip', output];
};

ResizerStream.prototype.getParameters = function() {
  return [].concat(this.before())
          .concat('-')
          .concat(this.parameters())
          .concat(this.baseParameters())
          .concat(this.after());
};

ResizerStream.prototype.setup = function() {
  if(this._setup)
    return;

  console.time('setup');

  var parameters = this.getParameters();
  var convert = process.spawn("gm", ["convert"].concat(parameters), {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  this.inStream = convert.stdin;
  this.outStream = convert.stdout;

  var resizer = this;

  this.outStream.on('readable', function(data) {
    resizer.read(0);
  });

  this.outStream.on('end', function() {
    resizer.push(null);
  });

  this.once('finish', function() {
    console.timeEnd('transfer data');
    this.inStream.end();
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

  console.timeEnd('setup');
  console.time('transfer data');
};

ResizerStream.prototype._error = function(message) {
  this.emit('error', message);
};

ResizerStream.prototype._write = function(chunk, encoding, callback) {
  this.setup();
  if (this.inStream.write(chunk, encoding)) {
    callback();
  }
  else {
    this.inStream.once('drain', callback);
  }
};

ResizerStream.prototype._read = function(n) {
  if (!this._setup)
    return this.push('');

  var chunk = null,
      ok = true;

  while(ok && (null !== (chunk = this.outStream.read()))) {
    ok = this.push(chunk);
  }

  this.push('');
};

module.exports = ResizerStream;