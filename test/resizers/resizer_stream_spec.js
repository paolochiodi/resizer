var Cover = require('../../lib/resizers/resizer_stream');
var Stream = require('stream');
var process = require('child_process');


function fakeConvertAndExitIn(time) {
  var EventEmitter = require('events').EventEmitter;
  var convert = new EventEmitter();

  convert.stdin = new Stream.PassThrough();
  convert.stdout = convert.stdin;
  convert.stderr = new Stream.PassThrough();

  setTimeout(function() {
    convert.emit('exit', 0);
  }, time);

  return convert;
}

function fakeConvertAndEmit(eventName, eventMessageA, eventMessageB) {
  var EventEmitter = require('events').EventEmitter;
  var convert = new EventEmitter();

  convert.stdin = new Stream.Transform();
  convert.stdout = convert.stdin;
  convert.stderr = new Stream.PassThrough();


  convert.stdin._transform = function(chunk, encoding, cb) {
    this.push(chunk);
    convert.emit(eventName, eventMessageA, eventMessageB);
    cb();
  };

  return convert;
}

function fakeInfiniteConvert() {
  var EventEmitter = require('events').EventEmitter;
  var convert = new EventEmitter();

  convert.stdin = new Stream.PassThrough();
  convert.stdout = convert.stdin;
  convert.stderr = new Stream.PassThrough();


  convert.kill = function(signal) {
    expect(signal).to.be.equal('SIGKILL');
    convert.emit('exit', 9);
  };

  return convert;
}

describe("ResizerStream", function() {

  afterEach(function() {
    process.spawn.restore && process.spawn.restore();
  });

  it("should be a Duplex stream", function() {
    var resizer = new Cover({ height: 100, width: 200 });
    expect(resizer).to.be.an.instanceof(Stream.Duplex);
  });

  it("should emit an error if graphics magick exits with code != 0", function(end) {
    sinon.stub(process, 'spawn', function() {
      var convert = fakeConvertAndEmit('exit', 1);
      convert.stderr.write('error message');

      return convert;
    });

    var resizer = new Cover({ height: 100, width: 200 });
    resizer.on('error', function(message) {
      expect(message).to.be.equal('GM process exited with code 1');
      end();
    });

    resizer.write('data');
  });

  it("should emit an error if graphics magick exits with code null", function(end) {
    sinon.stub(process, 'spawn', function() {
      var convert = fakeConvertAndEmit('exit', null);
      convert.stderr.write('error message');

      return convert;
    });

    var resizer = new Cover({ height: 100, width: 200 });
    resizer.on('error', function(message) {
      expect(message).to.be.equal('GM process exited without code');
      end();
    });

    resizer.write('data');
  });

  it("should emit an error if graphics magick exits with signal KILL", function(end) {
    sinon.stub(process, 'spawn', function() {
      var convert = fakeConvertAndEmit('exit', null, 'KILL');
      convert.stderr.write('error message');

      return convert;
    });

    var resizer = new Cover({ height: 100, width: 200 });
    resizer.on('error', function(message) {
      expect(message).to.be.equal('GM process exited due to signal KILL');
      end();
    });

    resizer.write('data');
  });

  it("should emit an error if graphics magick emits error", function(end) {
    sinon.stub(process, 'spawn', function() {
      return fakeConvertAndEmit('error', 'error message');
    });

    var resizer = new Cover({ height: 100, width: 200 });

    resizer.on('error', function(message) {
      expect(message).to.be.equal('error message');
      end();
    });

    resizer.write('data');
  });

  it("should log resize parameters", function(end) {
    sinon.stub(process, 'spawn', function() {
      return fakeConvertAndEmit('exit', 0);
    });

    var spy = sinon.spy();
    var resizer = new Cover({ height: 100, width: 200, debug: spy });

    resizer.on('exit', function() {
      expect(spy.called).to.be.equal(true);
      end();
    });

    resizer.write('some data');
  });

  it("should timeout gm execution", function(end) {
    sinon.stub(process, 'spawn', function() {
      return fakeInfiniteConvert();
    });

    var resizer = new Cover({ height: 100, width: 200, timeout: 2 });
    resizer.on('error', function(message) {
      expect(message).to.be.equal('GM process exited with code 9');
      end();
    });

    resizer.write('some data');
  });

  it("should convert to other formats", function() {
    var resizer = new Cover({ height: 100, width: 200, convertTo: 'jpg' });
    expect(resizer.baseParameters()).to.deep.equal(['-quality', '91', '+profile', '*', '-auto-orient', '-strip', 'jpg:-']);
  });

  it("should resize with the quality level specified", function() {
    var resizer = new Cover({ height: 100, width: 200, quality: '99' });
    expect(resizer.baseParameters()).to.deep.equal(['-quality', '99', '+profile', '*', '-auto-orient', '-strip', '-']);
  });

  it("should resize with the default quality level if no other is specified", function() {
    var resizer = new Cover({ height: 100, width: 200 });
    expect(resizer.baseParameters()).to.deep.equal(['-quality', '91', '+profile', '*', '-auto-orient', '-strip', '-']);
  });

  it('should log GM execution time', function(end) {
    clock = sinon.useFakeTimers((new Date()).getTime());

    sinon.stub(process, 'spawn', function() {
      return fakeConvertAndExitIn(3);
    });

    var debug = sinon.spy();
    var resizer = new Cover({ height: 100, width: 200, convertTo: 'jpg', debug: debug });

    resizer.on('exit', function() {
      expect(debug).to.have.been.called;
      expect(debug).to.have.been.calledWithMatch(/GM exited in 3 ms/);

      clock.restore();
      end();
    });

    resizer.end();
    clock.tick(3);
  });

});