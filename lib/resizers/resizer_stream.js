var util = require('util');
var spawn = require("child_process").spawn;
var Transform = require('stream').Transform;

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

ResizerStream.prototype.getParameters = function() {
  return [].concat(this.before()).concat('-').concat(this.parameters()).concat('-').concat(this.after());
};

ResizerStream.prototype.setup = function() {
  if(this._setup)
    return;

  var convert = spawn("gm", ["convert"].concat(this.getParameters()), {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  this.inStream = convert.stdin;
  this.outStream = convert.stdout;

  var cover = this;
  this.outStream.on('readable', function(data){
    while (null !== (chunk = cover.outStream.read())) {
      cover.push(chunk);
    }
  });

  this.outStream.once('end', function() {
    cover.flushCb();
  });

  convert.on('error', function(err) {
    console.log('error', err);
    // console.log(convert.stderr.read());
  });

  this._setup = true;
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