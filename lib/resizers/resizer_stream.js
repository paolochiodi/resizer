var util = require('util');
var process = require("child_process");
var Duplex = require('stream').Duplex;
var chunker = require('bytechunker');

util.inherits(ResizerStream, Duplex);

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

ResizerStream.prototype._write = function(chunk, encoding, callback) {
  setup(this);

  if (this._inStream.write(chunk, encoding)) {
    callback();
  }
  else {
    this._inStream.once('drain', callback);
  }
};

ResizerStream.prototype._read = function(n) {
  this._outStream && this._outStream.resume();
};

function setup(stream) {
  if(stream._setup)
    return;


  var convert, inStream, outStream, timeout;
  var exited, ended;
  var parameters = stream.getParameters();

  convert = process.spawn("gm", ["convert"].concat(parameters), {
    stdio: ['pipe', 'pipe', 'pipe']
  });


  inStream = convert.stdin;
  outStream = convert.stdout;


  stream._debug('Resizer: resizing with ' + parameters.join(' '));


  function ondata(chunk) {
    if(!stream.push(chunk)) {
      outStream.pause();
    }
  }
  outStream.on('data', ondata);


  function onend() {
    stream.push(null);

    ended = true;

    if(exited)
      cleanup();
  }
  outStream.once('end', onend);


  function onfinish() {
    inStream.end();
  }
  stream.once('finish', onfinish);


  function onerror(err) {
    cleanup();
    error(stream, err);
  }
  convert.on('error', onerror);


  function onexit(code) {
    clearTimeout(timeout);

    if(code !== 0) {
      cleanup();
      error(stream, 'GM process exited with code ' + code.toString());
    }
    else {
      if(ended)
        cleanup();

      stream.emit('exit');
    }

    exited = true;
  }
  convert.on('exit', onexit);

  // prevent stale gm processes
  function onkill() {
    convert.kill('SIGKILL');
  }
  timeout = setTimeout(onkill, stream.options.timeout || 10*1000);

  function cleanup() {
    if (timeout)
      clearTimeout(timeout);

    inStream.removeAllListeners('drain');

    outStream.removeListener('data', ondata);
    outStream.removeListener('end', onend);

    stream.removeListener('finish', onfinish);
    stream.removeListener('error', onerror);

    convert.removeListener('exit', onexit);

    stream._inStream = null;
    stream._outStream = null;
    cleanup = null;
  }

  stream._setup = true;
  stream._inStream = inStream;
  stream._outStream = outStream;
}

function error(stream, message) {
  stream.emit('error', message);
}


module.exports = ResizerStream;