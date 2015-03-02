MOCHA = node_modules/.bin/_mocha
ISTANBUL = node_modules/.bin/istanbul
ISTANBUL_COMMAND = cover
JSHINT = node_modules/.bin/jshint
JSHINT_REPORTER = unix
JSCS = node_modules/.bin/jscs
JSCS_REPORTER = inline
TESTS = test
NODE_ENV = test
REPORTER = spec
TIMEOUT = 7000
BIN = node

test: $(MOCHA)
	@NODE_ENV=$(NODE_ENV) \
		$(BIN) $(FLAGS) \
		$(MOCHA) \
		--timeout $(TIMEOUT) \
		--reporter $(REPORTER) \
		test/globals.js $(TESTS) \
		--recursive

test-cov: $(MOCHA) $(ISTANBUL)
	@NODE_ENV=test $(BIN) $(FLAGS) \
		$(ISTANBUL) $(ISTANBUL_COMMAND) \
		$(MOCHA) \
		-- -u exports \
		--timeout $(TIMEOUT) \
		--reporter $(REPORTER) \
		test/globals.js $(TESTS) \
		--recursive \
		--bail

test-travis: .travis.yml lint
	@NODE_ENV=test $(BIN) $(FLAGS) \
		$(ISTANBUL) $(ISTANBUL_COMMAND) \
		$(MOCHA) \
		-- -u exports \
		--timeout $(TIMEOUT) \
		--reporter $(REPORTER) \
		--report lconvonly \
		test/globals.js $(TESTS) \
		--recursive

jshint: $(JSHINT) $(JSCS)
	@echo "Running JSHint..."; \
	NODE_ENV=test $(BIN) $(FLAGS) \
		$(JSHINT) . --reporter=$(JSHINT_REPORTER) \
        && echo "JSHint ok!"

jscs:
	@echo "Running JSCS..."; \
	NODE_ENV=test $(BIN) $(FLAGS) \
		$(JSCS) . --reporter=$(JSCS_REPORTER) \
        && echo "JSCS ok!"

lint: jshint jscs

.PHONY: test test-cov test-travis jshint jscs lint