var Cover = require('../../lib/resizers/resizer_stream');
var Stream = require('stream');


function fakeConvertAndEmit(eventName) {
  var EventEmitter = require('events').EventEmitter;
  var convert = new EventEmitter();

  convert.stdin = new Stream.Transform();
  convert.stdout = convert.stdin;
  convert.stderr = new Stream.Readable();

  convert.stdin._transform = function(chunk, encoding, cb) {
    this.push(chunk);
    convert.emit(eventName);
    cb();
  };

  return convert;
}

describe("ResizerStream", function() {

  it("should be a Transform stream", function() {
    var resizer = new Cover({ height: 100, width: 200 });
    expect(resizer).to.be.an.instanceof(Stream.Transform);
  });

  it("should emit an error if graphics magick exits with code != 0", function(end) {
    var process = require('child_process');
    var resizer = new Cover({ height: 100, width: 200 });

    sinon.stub(process, 'spawn', function() {
      return fakeConvertAndEmit('exit');
    });

    resizer.on('error', function() {
      process.spawn.restore();
      end();
    });

    resizer.write('data');
  });

  it("should emit an error if graphics magick emits error", function(end) {
    var process = require('child_process');
    var resizer = new Cover({ height: 100, width: 200 });

    sinon.stub(process, 'spawn', function() {
      return fakeConvertAndEmit('error');
    });

    resizer.on('error', function() {
      process.spawn.restore();
      end();
    });

    resizer.write('data');
  });

});