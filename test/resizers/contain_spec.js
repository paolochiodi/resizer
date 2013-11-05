var Contain = require('../../lib/resizers/contain');
var Transform = require('stream').Transform;

describe("Contain", function() {

  it("should be a Transform stream", function() {
    var resizer = new Contain({ height: 100, width: 200 });
    expect(resizer).to.be.an.instanceof(Transform);
  });

  it("with both height and width should generate the parameters correctly", function() {
    var resizer = new Contain({ height: 100, width: 200 });
    expect(resizer.getParameters()).to.deep.equal(['-', '-size', '200x100>', '-thumbnail', '200x100>', '-quality', '91', '+profile', '*', '-auto-orient', '-']);
  });

  it("with only height should generate the parameters correctly", function() {
    var resizer = new Contain({ height: 100 });
    expect(resizer.getParameters()).to.deep.equal(['-', '-size', 'x100>', '-thumbnail', 'x100>', '-quality', '91', '+profile', '*', '-auto-orient', '-']);
  });

  it("with only width should generate the parameters correctly", function() {
    var resizer = new Contain({ width: 200 });
    expect(resizer.getParameters()).to.deep.equal(['-', '-size', '200x>', '-thumbnail', '200x>', '-quality', '91', '+profile', '*', '-auto-orient', '-']);
  });

});