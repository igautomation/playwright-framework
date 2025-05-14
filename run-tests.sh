#!/bin/bash

# Make all shell scripts in the scripts directory executable
echo "Making all shell scripts executable..."
chmod +x /workspace/scripts/*.sh
echo "All shell scripts are now executable."

# Run the tests
echo "Running tests..."
npm test