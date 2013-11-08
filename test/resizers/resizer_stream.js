var Cover = require('../../lib/resizers/resizer_stream');
var Stream = require('stream');
var process = require('child_process');


function fakeConvertAndEmit(eventName, eventMessage) {
  var EventEmitter = require('events').EventEmitter;
  var convert = new EventEmitter();

  convert.stdin = new Stream.Transform();
  convert.stdout = convert.stdin;
  convert.stderr = new Stream.PassThrough();

  convert.stdin._transform = function(chunk, encoding, cb) {
    this.push(chunk);
    convert.emit(eventName, eventMessage);
    cb();
  };

  return convert;
}

describe("ResizerStream", function() {

  afterEach(function() {
    process.spawn.restore && process.spawn.restore();
  });

  it("should be a Transform stream", function() {
    var resizer = new Cover({ height: 100, width: 200 });
    expect(resizer).to.be.an.instanceof(Stream.Transform);
  });

  it("should emit an error if graphics magick exits with code != 0", function(end) {
    var resizer = new Cover({ height: 100, width: 200 });

    sinon.stub(process, 'spawn', function() {
      var convert = fakeConvertAndEmit('exit', 1);
      convert.stderr.write('error message');

      return convert;
    });

    resizer.on('error', function(message) {
      expect(message).to.be.equal('GM process exited with code 1\nstderr:\nerror message');
      end();
    });

    resizer.write('data');
  });

  it("should emit an error if graphics magick emits error", function(end) {
    var process = require('child_process');
    var resizer = new Cover({ height: 100, width: 200 });

    sinon.stub(process, 'spawn', function() {
      return fakeConvertAndEmit('error', 'error message');
    });

    resizer.on('error', function(message) {
      expect(message).to.be.equal('error message');
      end();
    });

    resizer.write('data');
  });

});