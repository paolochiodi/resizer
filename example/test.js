var fs = require('fs');
var resizers = require('../index');
var Cover = resizers.cover;
var Contain = resizers.contain;
var Crop = resizers.crop;

var inputImage = fs.createReadStream(__dirname + '/test.jpg');
var coverImage = fs.createWriteStream(__dirname + '/cover.jpg');
var containImage = fs.createWriteStream(__dirname + '/contain.jpg');
var containImageSingle = fs.createWriteStream(__dirname + '/contain_single.jpg');
var cropImage = fs.createWriteStream(__dirname + '/crop.jpg');

inputImage.pipe(Cover({height: 100, width: 200})).pipe(coverImage);
inputImage.pipe(Contain({height: 100, width: 200})).pipe(containImage);
inputImage.pipe(Contain({width: 200})).pipe(containImageSingle);
inputImage.pipe(Crop({height: 300, width: 300})).pipe(cropImage);

inputImage = fs.createReadStream(__dirname + '/test_oriented.jpg');
coverImage = fs.createWriteStream(__dirname + '/cover_oriented.jpg');
containImage = fs.createWriteStream(__dirname + '/contain_oriented.jpg');
containImageSingle = fs.createWriteStream(__dirname + '/contain_single_oriented.jpg');
cropImage = fs.createWriteStream(__dirname + '/crop_oriented.jpg');

inputImage.pipe(Cover({height: 100, width: 200})).pipe(coverImage);
inputImage.pipe(Contain({height: 100, width: 200})).pipe(containImage);
inputImage.pipe(Contain({width: 200})).pipe(containImageSingle);
inputImage.pipe(Crop({height: 300, width: 300})).pipe(cropImage);