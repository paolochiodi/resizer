var Contain = require('../../lib/resizers/contain');
var Duplex = require('stream').Duplex;

describe("Contain", function() {

  it("should be a Duplex stream", function() {
    var resizer = new Contain({ height: 100, width: 200 });
    expect(resizer).to.be.an.instanceof(Duplex);
  });

  it("with both height and width should generate the parameters correctly", function() {
    var resizer = new Contain({ height: 100, width: 200 });
    expect(resizer.getParameters()).to.deep.equal(['-size', '200x100', '-', '-thumbnail', '200x100>', '-quality', '91', '+profile', '*', '-auto-orient', '-strip', '-']);
  });

  it("with only height should generate the parameters correctly", function() {
    var resizer = new Contain({ height: 100 });
    expect(resizer.getParameters()).to.deep.equal(['-size', '133x100', '-', '-thumbnail', 'x100>', '-quality', '91', '+profile', '*', '-auto-orient', '-strip', '-']);
  });

  it("with only width should generate the parameters correctly", function() {
    var resizer = new Contain({ width: 200 });
    expect(resizer.getParameters()).to.deep.equal(['-size', '200x150', '-', '-thumbnail', '200x>', '-quality', '91', '+profile', '*', '-auto-orient', '-strip', '-']);
  });

});