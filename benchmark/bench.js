var fs = require('fs');
var Resizer = require('../index.js');
var Suite = require('benchmark').Suite;
var gm = require('gm');
var imagemagick = require('imagemagick-native');

var standard = new Suite();

function buildResizer(image) {
  return (function(deferred) {
    var input = fs.createReadStream(__dirname + '/fixtures/' + image);
    var output = fs.createWriteStream(__dirname + '/fixtures/output.jpg');

    var resizer = new Resizer.contain({ height: 100, width: 100});

    resizer.on('exit', function() {
      deferred.resolve();
    });

    resizer.on('error', function(message) {
      console.log('error', message);
    });

    input.pipe(resizer).pipe(output);
  });
}

function buildGM(image) {
  return (function(deferred) {
    gm(__dirname + '/fixtures/' + image)
      .in('-size', '100x100')
      .thumbnail('100', '100')
      .quality(91)
      .write(__dirname + '/fixtures/output.jpg', function (err) {
        if (err) console.log('GM Error', err);
        deferred.resolve();
      });
  });
}

function buildNative(image) {
  return (function() {
    var srcData = fs.readFileSync(__dirname + '/fixtures/' + image);

    var resizedBuffer = imagemagick.convert({
      srcData: srcData,
      width: 100,
      height: 100,
      resizeStyle: "aspectfit",
      quality: 91,
      format: 'JPEG'
    });
  });
}

standard.add({
  name: 'resizer',
  defer: true,
  fn: buildResizer('standard.jpg')
});

standard.add({
  name: 'gm',
  defer: true,
  fn: buildGM('standard.jpg')
});

standard.add({
  name: 'imagemgick-native',
  fn: buildNative('standard.jpg')
});

standard.on('cycle', function(event) {
  console.log(String(event.target));
});

standard.run({async: true});