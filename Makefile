#
# Makefile
#
# Start with @ to hide source
#
# If you get "*** missing separator.  Stop.", it means you have spaces where 
# there should be a tab
#
# Tips:
#   - For $ signs, you'll need to escape with $ (ex. $$)
#   - $! gets the PID of the last process
# 
# @author Eugene Song <tilleps@gmail.com>
#
BIN_PATH = ./node_modules/.bin/


# PHONY (So script doesn't conflict with filename)
.PHONY: install build

install:
	npm install

# Not really sure if --output-library-target is needed
build:
	$(BIN_PATH)webpack --output-library StateMachine --output-library-target umd lib/index.js dist/state-machine.js
	cp dist/state-machine.js example/scripts/state-machine.js
