#!/bin/bash

# Make the script executable
chmod +x $(dirname "$0")/run-ui-tests.js

# Run the UI tests script
node $(dirname "$0")/run-ui-tests.js