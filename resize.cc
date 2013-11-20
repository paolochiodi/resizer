#include <node.h>
#include <v8.h>
#include <node_buffer.h>
#include <Magick++.h>

#define THROW_ERROR_EXCEPTION(x) ThrowException(v8::Exception::Error(String::New(x))); \
    scope.Close(Undefined())

using namespace v8;

void AutoOrient (Magick::Image *image ) {
  Magick::OrientationType orientation = image->orientation();

  if ( orientation != Magick::UndefinedOrientation && orientation != Magick::TopLeftOrientation ) {

    MagickLib::ExceptionInfo exceptionInfo;
    MagickLib::GetExceptionInfo( &exceptionInfo );
    MagickLib::Image *newImage = AutoOrientImage( image->image(), orientation, &exceptionInfo );
    image->replaceImage( newImage );
    Magick::throwException( exceptionInfo );
  }
}

void ApplyBasicOptions (Magick::Image *image ) {
  image->quality( 91 );
  image->strip();
}

void ImageThumbnail (Magick::Image *image, const char *geometryString) {
  MagickLib::RectangleInfo geometry;
  MagickLib::GetImageGeometry( image->image(), geometryString, 1, &geometry );

  MagickLib::ExceptionInfo exceptionInfo;
  MagickLib::GetExceptionInfo( &exceptionInfo );
  MagickLib::Image *newImage = MagickLib::ThumbnailImage( image->image(), geometry.width, geometry.height, &exceptionInfo );
  image->replaceImage( newImage );
  Magick::throwException( exceptionInfo );
}

Handle<Value> Contain(const Arguments& args) {
  HandleScope scope;

  Magick::InitializeMagick( NULL );

  Local<Object> srcData = Local<Object>::Cast( args[ 0 ] );
  Local<Object> options = Local<Object>::Cast( args[ 1 ] );
  Local<Function> cb = Local<Function>::Cast( args[ 2 ] );

  unsigned int width = options->Get( String::NewSymbol("width") )->Uint32Value();
  unsigned int height = options->Get( String::NewSymbol("height") )->Uint32Value();

  Magick::Blob srcBlob( node::Buffer::Data(srcData), node::Buffer::Length(srcData) );

  Magick::Geometry size;
  if (width && height)
    size = Magick::Geometry(width, height);
  else
    size = Magick::Geometry(1024, 768);

  Magick::Image image;
  image.read( srcBlob, size, 8 );

  AutoOrient(&image);

  if ( ! width  ) { width  = image.columns(); }
  if ( ! height ) { height = image.rows();    }

  char geometryString[ 32 ];
  sprintf( geometryString, "%dx%d>", width, height );

  ImageThumbnail( &image, geometryString );

  ApplyBasicOptions(&image);

  Magick::Blob dstBlob;
  image.write( &dstBlob );

  node::Buffer* retBuffer = node::Buffer::New( dstBlob.length() );
  memcpy( node::Buffer::Data( retBuffer->handle_ ), dstBlob.data(), dstBlob.length() );

  const unsigned argc = 1;
  Local<Value> argv[argc] = { Local<Value>::New( retBuffer->handle_ ) };
  cb->Call(Context::GetCurrent()->Global(), argc, argv);

  return scope.Close( Undefined() );
}

Handle<Value> Cover(const Arguments& args) {
  HandleScope scope;

  Magick::InitializeMagick( NULL );

  Local<Object> srcData = Local<Object>::Cast( args[ 0 ] );
  Local<Object> options = Local<Object>::Cast( args[ 1 ] );
  Local<Function> cb = Local<Function>::Cast( args[ 2 ] );

  unsigned int width = options->Get( String::NewSymbol("width") )->Uint32Value();
  unsigned int height = options->Get( String::NewSymbol("height") )->Uint32Value();

  Magick::Blob srcBlob( node::Buffer::Data(srcData), node::Buffer::Length(srcData) );

  Magick::Geometry size;
  if (width && height)
    size = Magick::Geometry(width, height);
  else
    size = Magick::Geometry(1024, 768);


  Magick::Image image;
  image.read( srcBlob, size, 8 );

  AutoOrient(&image);

  if ( ! width  ) { width  = image.columns(); }
  if ( ! height ) { height = image.rows();    }

  double aspectratioExpected = (double)height / (double)width;
  double aspectratioOriginal = (double)image.rows() / (double)image.columns();
  unsigned int xoffset = 0;
  unsigned int yoffset = 0;
  unsigned int cropWidth;
  unsigned int cropHeight;

  if ( aspectratioExpected > aspectratioOriginal ) {
    // expected is taller
    cropHeight = image.rows();
    cropWidth = (unsigned int)((double)cropHeight * aspectratioExpected);

    xoffset      = (unsigned int)( ((double)image.columns() - cropWidth) / 2. );
    yoffset      = 0;
  }
  else {
    // expected is wider
    cropWidth = image.columns();
    cropHeight = (unsigned int)((double)cropWidth * aspectratioExpected);

    xoffset      = 0;
    yoffset      = (unsigned int)( ((double)image.rows() - cropHeight) / 2. );
  }

  Magick::Geometry cropGeometry( cropWidth, cropHeight, xoffset, yoffset, 0, 0 );
  image.crop( cropGeometry );

  char geometryString[ 32 ];
  sprintf( geometryString, "%dx%d>", width, height );
  ImageThumbnail( &image, geometryString );

  ApplyBasicOptions(&image);

  Magick::Blob dstBlob;
  image.write( &dstBlob );

  node::Buffer* retBuffer = node::Buffer::New( dstBlob.length() );
  memcpy( node::Buffer::Data( retBuffer->handle_ ), dstBlob.data(), dstBlob.length() );

  const unsigned argc = 1;
  Local<Value> argv[argc] = { Local<Value>::New( retBuffer->handle_ ) };
  cb->Call(Context::GetCurrent()->Global(), argc, argv);

  return scope.Close( Undefined() );
};

Handle<Value> Crop(const Arguments& args) {
  HandleScope scope;

  Magick::InitializeMagick( NULL );

  Local<Object> srcData = Local<Object>::Cast( args[ 0 ] );
  Local<Object> options = Local<Object>::Cast( args[ 1 ] );
  Local<Function> cb = Local<Function>::Cast( args[ 2 ] );

  unsigned int width = options->Get( String::NewSymbol("width") )->Uint32Value();;
  unsigned int height = options->Get( String::NewSymbol("height") )->Uint32Value();

  Magick::Blob srcBlob( node::Buffer::Data(srcData), node::Buffer::Length(srcData) );

  Magick::Geometry size = Magick::Geometry(1024, 768);

  Magick::Image image;
  image.read( srcBlob, size, 8 );

  AutoOrient(&image);

  if ( ! width  ) { width  = image.columns(); }
  if ( ! height ) { height = image.rows();    }

  Magick::Geometry geometry = Magick::Geometry(width, height, (image.columns() - width) / 2, (image.rows() - height) / 2);

  image.crop( geometry );

  ApplyBasicOptions(&image);

  Magick::Blob dstBlob;
  image.write( &dstBlob );

  node::Buffer* retBuffer = node::Buffer::New( dstBlob.length() );
  memcpy( node::Buffer::Data( retBuffer->handle_ ), dstBlob.data(), dstBlob.length() );

  const unsigned argc = 1;
  Local<Value> argv[argc] = { Local<Value>::New( retBuffer->handle_ ) };
  cb->Call(Context::GetCurrent()->Global(), argc, argv);

  return scope.Close( Undefined() );
};


void init(Handle<Object> exports) {
  exports->Set(String::NewSymbol("Contain"),
      FunctionTemplate::New(Contain)->GetFunction());
  exports->Set(String::NewSymbol("Cover"),
      FunctionTemplate::New(Cover)->GetFunction());
  exports->Set(String::NewSymbol("Crop"),
      FunctionTemplate::New(Crop)->GetFunction());
}

NODE_MODULE(resize, init)