#include <node.h>
#include <v8.h>
#include <node_buffer.h>
#include <Magick++.h>

#define THROW_ERROR_EXCEPTION(x) ThrowException(v8::Exception::Error(String::New(x))); \
    scope.Close(Undefined())

using namespace v8;

void ApplyBasicOptions(Magick::Image *image) {
  image->quality( 91 );
  image->strip();
}

void ImageThumbnail (Magick::Image *image, const char *geometryString)
{
  MagickLib::RectangleInfo geometry;
  MagickLib::GetImageGeometry(image->image(), geometryString, 1, &geometry);

  MagickLib::ExceptionInfo exceptionInfo;
  MagickLib::GetExceptionInfo( &exceptionInfo );
  MagickLib::Image* newImage = MagickLib::ThumbnailImage( image->image(), geometry.width, geometry.height, &exceptionInfo );
  image->replaceImage( newImage );
  Magick::throwException( exceptionInfo );
}

Handle<Value> Contain(const Arguments& args) {
  HandleScope scope;

  Magick::InitializeMagick( NULL );

  Local<Object> srcData = Local<Object>::Cast( args[ 0 ] );
  Local<Object> options = Local<Object>::Cast( args[ 1 ] );

  unsigned int width = options->Get( String::NewSymbol("width") )->Uint32Value();;
  unsigned int height = options->Get( String::NewSymbol("height") )->Uint32Value();

  Magick::Blob srcBlob( node::Buffer::Data(srcData), node::Buffer::Length(srcData) );

  Magick::Geometry size;
  if (width && height)
    size = Magick::Geometry(width, height);
  else
    size = Magick::Geometry(1024, 768);

  Magick::Image image;
  image.read( srcBlob, size, 8 );

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

  return scope.Close( retBuffer->handle_ );
}

Handle<Value> Cover(const Arguments& args) {
  HandleScope scope;

  Magick::InitializeMagick( NULL );

  Local<Object> srcData = Local<Object>::Cast( args[ 0 ] );
  Local<Object> options = Local<Object>::Cast( args[ 1 ] );

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

  if ( ! width  ) { width  = image.columns(); }
  if ( ! height ) { height = image.rows();    }

  double aspectratioExpected = (double)height / (double)width;
  double aspectratioOriginal = (double)image.rows() / (double)image.columns();
  unsigned int xoffset = 0;
  unsigned int yoffset = 0;
  unsigned int resizewidth;
  unsigned int resizeheight;
  if ( aspectratioExpected > aspectratioOriginal ) {
    // expected is taller
    resizewidth  = (unsigned int)( (double)height / (double)image.rows() * (double)image.columns() + 1. );
    resizeheight = height;
    xoffset      = (unsigned int)( (resizewidth - width) / 2. );
    yoffset      = 0;
  }
  else {
    // expected is wider
    resizewidth  = width;
    resizeheight = (unsigned int)( (double)width / (double)image.columns() * (double)image.rows() + 1. );
    xoffset      = 0;
    yoffset      = (unsigned int)( (resizeheight - height) / 2. );
  }

  char geometryString[ 32 ];
  sprintf( geometryString, "%dx%d>", resizewidth, resizeheight );
  ImageThumbnail( &image, geometryString );

  Magick::Geometry cropGeometry( width, height, xoffset, yoffset, 0, 0 );
  image.crop( cropGeometry );

  ApplyBasicOptions(&image);

  Magick::Blob dstBlob;
  image.write( &dstBlob );

  node::Buffer* retBuffer = node::Buffer::New( dstBlob.length() );
  memcpy( node::Buffer::Data( retBuffer->handle_ ), dstBlob.data(), dstBlob.length() );

  return scope.Close( retBuffer->handle_ );
};

Handle<Value> Crop(const Arguments& args) {
  HandleScope scope;

  Magick::InitializeMagick( NULL );

  Local<Object> srcData = Local<Object>::Cast( args[ 0 ] );
  Local<Object> options = Local<Object>::Cast( args[ 1 ] );

  unsigned int width = options->Get( String::NewSymbol("width") )->Uint32Value();;
  unsigned int height = options->Get( String::NewSymbol("height") )->Uint32Value();

  Magick::Blob srcBlob( node::Buffer::Data(srcData), node::Buffer::Length(srcData) );

  Magick::Geometry size = Magick::Geometry(1024, 768);

  Magick::Image image;
  image.read( srcBlob, size, 8 );

  if ( ! width  ) { width  = image.columns(); }
  if ( ! height ) { height = image.rows();    }

  Magick::Geometry geometry = Magick::Geometry(width, height, (image.columns() - width) / 2, (image.rows() - height) / 2);

  image.crop( geometry );

  ApplyBasicOptions(&image);

  Magick::Blob dstBlob;
  image.write( &dstBlob );

  node::Buffer* retBuffer = node::Buffer::New( dstBlob.length() );
  memcpy( node::Buffer::Data( retBuffer->handle_ ), dstBlob.data(), dstBlob.length() );

  return scope.Close( retBuffer->handle_ );
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