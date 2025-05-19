#!/bin/bash

# Script to run Docker verification tests
echo "Running Docker verification tests..."

# Build the Docker image
docker build -t playwright-framework-test -f Dockerfile.validation .

# Run the tests in Docker
docker run --rm playwright-framework-test npm run test:docker