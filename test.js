var fs = require('fs');
var resizers = require('./index');
var Cover = resizers.cover;
var Contain = resizers.contain;

var inputImage = fs.createReadStream(__dirname + '/test.jpg');
var coverImage = fs.createWriteStream(__dirname + '/cover.jpg');
var containImage = fs.createWriteStream(__dirname + '/contain.jpg');
var containImageSingle = fs.createWriteStream(__dirname + '/contain_single.jpg');

inputImage.pipe(Cover({height: 100, width: 200})).pipe(coverImage);
inputImage.pipe(Contain({height: 100, width: 200})).pipe(containImage);
inputImage.pipe(Contain({width: 200})).pipe(containImageSingle);