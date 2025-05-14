#!/bin/bash

# Make all shell scripts in the scripts directory executable
echo "Making all shell scripts executable..."
chmod +x $(find "$(dirname "$0")" -name "*.sh")
echo "All shell scripts are now executable."

# Make all JavaScript scripts in the scripts directory executable
echo "Making all JavaScript scripts executable..."
chmod +x $(find "$(dirname "$0")" -name "*.js")
echo "All JavaScript scripts are now executable."