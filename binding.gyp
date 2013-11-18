{
  "targets": [
    {
      "target_name": "resize",
      "sources": [ "resize.cc" ],
      "conditions": [
        ['OS=="mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'OTHER_CFLAGS': [
              '<!@(GraphicsMagick++-config --cppflags --cxxflags)'
            ]
          },
          "libraries": [
             '<!@(GraphicsMagick++-config --ldflags --libs)',
          ],
          'cflags': [
            '<!@(GraphicsMagick++-config --cxxflags --cppflags)'
          ],
        }]
      ]
    }
  ]
}