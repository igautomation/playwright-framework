#!/bin/bash

# Make UI test scripts executable
echo "Making UI test scripts executable..."

# Make UI test scripts executable
chmod +x $(dirname "$0")/run-ui-tests.sh
chmod +x $(dirname "$0")/run-ui-tests.js

echo "UI test scripts are now executable."