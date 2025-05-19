#!/bin/bash

# Make all Docker-related scripts executable
echo "Making all Docker-related scripts executable..."

# Make Docker scripts executable
chmod +x $(dirname "$0")/run-docker-verify.sh
chmod +x $(dirname "$0")/verify-docker.sh

echo "All Docker scripts are now executable."