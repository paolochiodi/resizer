var Cover = require('../../lib/resizers/cover');
var Duplex = require('stream').Duplex;

describe("Cover", function() {

  it("should be a Duplex stream", function() {
    var resizer = new Cover({ height: 100, width: 200 });
    expect(resizer).to.be.an.instanceof(Duplex);
  });

  it("with both height and width should generate the parameters correctly", function() {
    var resizer = new Cover({ height: 100, width: 200 });
    expect(resizer.getParameters()).to.deep.equal(['-size', '200x100^', '-', '-thumbnail', '200x100>^', '-gravity', 'center', '-extent', '200x100>', '-quality', '91', '+profile', '*', '-auto-orient', '-strip', '-']);
  });

});