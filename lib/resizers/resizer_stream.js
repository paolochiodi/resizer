var util = require('util');
var child_process = require("child_process");
var Duplex = require('stream').Duplex;
var chunker = require('bytechunker');
var DEFAULT_QUALITY='91';

function empty() {}

util.inherits(ResizerStream, Duplex);

function ResizerStream(options) {
  if (!(this instanceof ResizerStream))
    return new ResizerStream(options);

  Duplex.call(this, {  });

  this.options = options;

  setup(this, options);
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

  return ['-quality', this.options.quality || DEFAULT_QUALITY, '+profile', '*', '-auto-orient', '-strip', output];
};

ResizerStream.prototype.getParameters = function() {
  return [].concat(this.before())
          .concat('-')
          .concat(this.parameters())
          .concat(this.baseParameters())
          .concat(this.after());
};

ResizerStream.prototype._write = function(chunk, encoding, cb) {
  if (true === this._inStream.write(chunk, encoding)) {
    cb();
  }
  else {
    this._drainCallbacks.push(cb);
  }
};

ResizerStream.prototype._read = function() {
  this._outStream && this._outStream.resume();
};

function setup(stream, options) {
  var convert, inStream, outStream, timeout, debug, streamId;
  var exited, ended;
  var gmStartTime;
  var drainCallbacks = stream._drainCallbacks = [];

  if (options.debug) {
    debug = function(msg) { options.debug('Resizer [' + streamId + ']: ' + msg); };
  }
  else {
    debug = empty;
  }

  streamId = process.pid + '-' + (new Date()).toISOString() + Math.round(Math.random() * 1000000);

  var parameters = stream.getParameters();
  convert = child_process.spawn("gm", ["convert"].concat(parameters), {
    stdio: ['pipe', 'pipe', 'ignore']
  });


  inStream = chunker(5120);
  inStream = inStream.pipe(convert.stdin);
  outStream = convert.stdout;


  debug('Resizing with ' + parameters.join(' '));


  function ondrain() {
    var cb;
    while(cb = drainCallbacks.shift()) {
      cb();
    }
  }
  inStream.on('drain', ondrain);

  function ondata(chunk) {
    if(false === stream.push(chunk)) {
      outStream.pause();
    }
  }
  outStream.on('data', ondata);


  function onend() {
    debug('output stream ended');

    stream.push(null);

    ended = true;

    if(exited)
      cleanup();
  }
  outStream.once('end', onend);


  function onfinish() {
    gmStartTime = (new Date()).getTime();
    inStream.end();
  }
  stream.once('finish', onfinish);


  function onerror(err) {
    reportError(err);
  }
  convert.on('error', onerror);


  function onexit(code, signal) {
    clearTimeout(timeout);

    if(code !== 0) {
      if (code)
        reportError('GM process exited with code ' + code.toString());
      else if (signal)
        reportError('GM process exited due to signal ' + signal.toString());
      else
        reportError('GM process exited without code');
    }
    else {
      if(gmStartTime) {
        debug('GM exited in ' + ((new Date()).getTime() - gmStartTime) + ' ms');
      }
      else {
        debug('GM exited');
      }

      if(ended)
        cleanup();

      stream.emit('exit');
    }

    exited = true;
  }
  convert.on('exit', onexit);


  // prevent stale gm processes
  function onkill() {
    debug('resize timed out, killing process');
    convert.kill('SIGKILL');
  }
  timeout = setTimeout(onkill, options.timeout || 10*1000);

  function reportError(message) {
    if(message && message.toString) {
      debug('error: ' + message.toString());
    }
    else {
      debug('error without message');
    }

    cleanup();
    stream.emit('error', message);
  }


  function cleanup() {
    if (timeout)
      clearTimeout(timeout);

    inStream.removeListener('drain', ondrain);
    // ensure all callbacks have been called
    ondrain();

    outStream.removeListener('data', ondata);
    outStream.removeListener('end', onend);

    stream.removeListener('finish', onfinish);
    stream.removeListener('error', onerror);

    convert.removeListener('exit', onexit);

    stream._inStream = inStream = null;
    stream._outStream = outStream = null;
    stream._drainCallbacks = drainCallbacks = null;

    gmStartTime = null;
    convert = null;

    cleanup = null;

    debug('cleaned up');
    debug = null;
  }

  stream._inStream = inStream;
  stream._outStream = outStream;
}


module.exports = ResizerStream;