var fs = require('fs');
var Resizer = require('../index.js');
var Suite = require('benchmark').Suite;
var suite = new Suite();

function buildFunction(resizerName, options, image, result) {
  if(!result) {
    result = 'output.jpg';
  }

  return (function(deferred) {
    var input = fs.createReadStream(__dirname + '/fixtures/' + image);
    var output = fs.createWriteStream(__dirname + '/fixtures/' + result);

    var resizer = new Resizer[resizerName](options);

    resizer.on('exit', function() {
      deferred.resolve();
    });

    resizer.on('error', function(message) {
      console.log('error', message);
    });

    input.pipe(resizer).pipe(output);
  });
}

function buildContain(image, result) {
  return buildFunction('contain', { height: 100, width: 100 }, image, result);
}

function buildContainSingle(image, result) {
  return buildFunction('contain', { width: 100 }, image, result);
}

function buildCover(image, result) {
  return buildFunction('cover', { height: 100, width: 100 }, image, result);
}

function buildCrop(image, result) {
  return buildFunction('crop', { height: 100, width: 100 }, image, result);
}

suite.add({
  name: 'Contain',
  defer: true,
  fn: buildContain('standard.jpg')
});

suite.add({
  name: 'Contain Small',
  defer: true,
  fn: buildContain('small.jpg')
});

suite.add({
  name: 'Contain Big',
  defer: true,
  fn: buildContain('big.jpg')
});

suite.add({
  name: 'Contain High DPI',
  defer: true,
  fn: buildContain('high_dpi.jpg')
});

suite.add({
  name: 'Contain PNG',
  defer: true,
  fn: buildContain('big.png', 'output.png')
});


suite.add({
  name: 'Contain Single',
  defer: true,
  fn: buildContainSingle('standard.jpg')
});

suite.add({
  name: 'Contain Small',
  defer: true,
  fn: buildContainSingle('small.jpg')
});

suite.add({
  name: 'Contain Single Big',
  defer: true,
  fn: buildContainSingle('big.jpg')
});

suite.add({
  name: 'Contain Single High DPI',
  defer: true,
  fn: buildContainSingle('high_dpi.jpg')
});

suite.add({
  name: 'Contain Single PNG',
  defer: true,
  fn: buildContainSingle('big.png', 'output.png')
});


suite.add({
  name: 'Cover',
  defer: true,
  fn: buildCover('standard.jpg')
});

suite.add({
  name: 'Cover Small',
  defer: true,
  fn: buildCover('small.jpg')
});

suite.add({
  name: 'Cover Big',
  defer: true,
  fn: buildCover('big.jpg')
});

suite.add({
  name: 'Cover High DPI',
  defer: true,
  fn: buildCover('high_dpi.jpg')
});

suite.add({
  name: 'Cover PNG',
  defer: true,
  fn: buildCover('big.png', 'output.png')
});


suite.add({
  name: 'Crop',
  defer: true,
  fn: buildCrop('standard.jpg')
});

suite.add({
  name: 'Crop Small',
  defer: true,
  fn: buildCrop('small.jpg')
});

suite.add({
  name: 'Crop Big Image',
  defer: true,
  fn: buildCrop('big.jpg')
});

suite.add({
  name: 'Crop High DPI',
  defer: true,
  fn: buildCrop('high_dpi.jpg')
});

suite.add({
  name: 'Crop PNG',
  defer: true,
  fn: buildCrop('big.png', 'output.png')
});


suite.on('cycle', function(event) {
  console.log(String(event.target));
});

suite.run({async: true});