# CHANGELOG

- 0.0.6 Option to specify image quality

  Thanks to https://github.com/SteveNewson

- 0.0.5 Bugfixing

  This should fix the bug caused by recursive nextTick being issue for some images

- 0.0.4 Bugfixing

  This should fix the bug caused by toString on gm exit code null. Minory memory usage improvements are expected

- 0.0.3 Move to duplex implementation and bugfixing

  This release should reduce memory leaks, handle backpressure better and fix hangup with 0-length images

- 0.0.2 Fix -size usage.

  This should speedup resize on contain with a single dimension for small images and should crop images correctly

- 0.0.1 Initial Releas