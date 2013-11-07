Resizer
=====

Resize is a thumbnail generator and image resizer for node with a transform stream interface.
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

inputImage.pipe(resizer.contain({height: 200, width:300})).pipe(outputImage)

```

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