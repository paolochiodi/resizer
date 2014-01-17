var fs = require('fs');
var gm = require('gm');
var Contain = require('../../lib/resizers/contain');

describe("Contain", function() {
  beforeEach(function() {
    input = fs.createReadStream(__dirname + '/test.jpg');
  });

  it("with both height and width should generate the correct image", function(end) {
    var resizer = new Contain({ height: 100, width: 200 });

    resizer.on('error', end);

    var stream = input.pipe(resizer);

    gm(stream).identify('%w %h %[EXIF:*]', function(err, data) {
      expect(data.trim()).to.be.equal('150 100');
      end();
    });
  });

  it("with only height should generate the correct image", function(end) {
    var resizer = new Contain({ height: 100 });

    resizer.on('error', end);

    var stream = input.pipe(resizer);

    gm(stream).identify('%w %h %[EXIF:*]', function(err, data) {
      expect(data.trim()).to.be.equal('150 100');
      end();
    });
  });

  it("with only width should generate the correct image", function(end) {
    var resizer = new Contain({ width: 200 });

    resizer.on('error', end);

    var stream = input.pipe(resizer);

    gm(stream).identify('%w %h %[EXIF:*]', function(err, data) {
      expect(data.trim()).to.be.equal('200 133');
      end();
    });
  });

});