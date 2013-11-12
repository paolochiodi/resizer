test:
	./node_modules/.bin/mocha --trace-deprecation --recursive test

bail:
	./node_modules/.bin/mocha --recursive test --bail --reporter spec

leak:
	./node_modules/.bin/mocha --check-leaks --recursive test

ci:
	./node_modules/.bin/mocha --recursive --watch test

benchme:
	node benchmark/benchme.js

jshint:
	find lib -name "*.js" -print0 | xargs -0 ./node_modules/.bin/jshint
	find test -name "*.js" -print0 | xargs -0 ./node_modules/.bin/jshint

.PHONY: test
