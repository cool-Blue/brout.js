SHELL := /bin/bash
PATH  := node_modules/.bin:${PATH}

tests   = ./test/*-test.js
version = $(shell node -p "require('./package.json').version")

.PHONY: test
test:
	@jslint --color lib/*.js ${tests}
	@browserify ${tests} | mocaccino -b | phantomic

release: test
ifeq (v${version},$(shell git tag -l v${version}))
	@echo "Version ${version} already released!"
	@exit 1
endif
	@echo "Creating tag v${version}"
	@git tag -a -m "Release ${version}" v${version}
	@git push --tags
	@echo "Publishing to npm"
	@npm publish
