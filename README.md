Resizer
=====

Resizer is a thumbnail generator and image resizer for node with a transform stream interface.
Its goal is to be simple and fast.
Current implementation is based on GraphicsMagick.

It is based on the Stream 2 API, so it will not work on node v0.8.
If you want node v0.8, please submit a pull-request.

## Dependecies
Make sure you have GraphicsMagick installed and in path.
You can install it through your package manager, on Ubuntu systems should be something like:

```
$: sudo apt-get update
$: sudo apt-get install graphicsmagick
```

## Installation

```
$: npm install resizer --save
```

## Pipe usage

```
var resizer = require('resizer')
  , fs = require('fs')
  , inputImage = fs.createReadStream(__dirname + '/input.jpg')
  , outputImage = fs.createWriteStream(__dirname + '/output.jpg');

inputImage.pipe(resizer.contain({height: 200, width:300})).pipe(outputImage);

```

## Thumbnail modes

Resizer can generate three type of thumbnail, modelled after css3 background-size specification: cover, contain, crop

### Contain

Creates an image whose sizes are at max the ones specified. Keeps aspect ratio.
You also can specify only width or height.

```
resizer.contain({height: 200, width:300});
resizer.contain({width:300});
```

### Cover

Creates an image whose sizes are exactly the ones specified.
The original image is scaled down to cover entirely the specified area and then the exceding parte of the image are "cut out" to fit the new aspect ratio.

```
resizer.cover({height: 200, width:300});
```

### Crop

Creates an image whose sizes are exactly the ones specified.
The reduced image is obtained picking it from a rectangle of the
same sizes from the center of the image.

```
resizer.crop({height: 200, width:300});
```

### Options

You can pass other options along with heigh and width:

* `debug`: a function called to print debug infos (defaults to empty function)
* `convertTo`: an image format to convert to. should be one supported by graphics magick (example: jpg)

### Output images

Resizer will do some additional changes to the output images:

* `auto-orient`: automatically orient the image data and discard orientation exif data
* `strip`: strip all metadata
* `quality`: set graphics magick quality to 91

This will be optional sometime in the future. If you really need them please open a feature request or, even better, submit a pull-request.


## Contributing to Resizer

* Check out the latest master to make sure the feature hasn't been
  implemented or the bug hasn't been fixed yet
* Check out the issue tracker to make sure someone already hasn't
  requested it and/or contributed it
* Fork the project
* Start a feature/bugfix branch
* Commit and push until you are happy with your contribution
* Make sure to add tests for it. This is important so I don't break it
  in a future version unintentionally.

## Tests

Resizer is tested with mocha, you can lunch the test suite with `make test`

## Benchmark

We have two benchmark suites:

* `make benchme` benchmark all types of thumbnails on different images, it is usefull to check performance after changes to the code
* `make bench` benchmark resizer against other common libraries for image resizing

## LICENSE - "BSD-2-Clause"

Copyright (c) 2013 Paolo Chiodi

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
