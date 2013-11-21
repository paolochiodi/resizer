var Crop = require('../../lib/resizers/crop');
var Transform = require('stream').Transform;

describe("Contain", function() {

  it("should be a Transform stream", function() {
    var resizer = new Crop({ height: 100, width: 200 });
    expect(resizer).to.be.an.instanceof(Transform);
  });

  it("with both height and width should generate the parameters correctly", function() {
    var resizer = new Crop({ height: 100, width: 200 });
    expect(resizer.getParameters()).to.deep.equal(['-', "-gravity", "center", "-extent", "200x100>", "-thumbnail", "200x100>", '-quality', '91', '+profile', '*', '-auto-orient', '-strip', '-']);
  });

});