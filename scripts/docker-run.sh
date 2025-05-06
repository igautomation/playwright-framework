#!/bin/bash

# Script to run tests in Docker

# Parse command line arguments
TAGS=""
HEADED=false
PROJECT=""

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --tags)
      TAGS="$2"
      shift
      shift
      ;;
    --headed)
      HEADED=true
      shift
      ;;
    --project)
      PROJECT="$2"
      shift
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Build the Docker image
echo "Building Docker image..."
docker build -t playwright-framework .

# Prepare the command
CMD="npm run test"

if [ ! -z "$TAGS" ]; then
  CMD="$CMD -- --tags \"$TAGS\""
fi

if [ "$HEADED" = true ]; then
  CMD="$CMD -- --headed"
fi

if [ ! -z "$PROJECT" ]; then
  CMD="$CMD -- --project $PROJECT"
fi

# Run the tests in Docker
echo "Running tests with command: $CMD"
docker run --rm \
  -v "$(pwd)/reports:/app/reports" \
  -v "$(pwd)/test-results:/app/test-results" \
  -v "$(pwd)/allure-results:/app/allure-results" \
  -e BASE_URL=${BASE_URL:-https://opensource-demo.orangehrmlive.com/web/index.php/auth/login} \
  -e API_URL=${API_URL:-https://petstore.swagger.io/v2} \
  -e USERNAME=${USERNAME:-Admin} \
  -e PASSWORD=${PASSWORD:-admin123} \
  -e HEADLESS=true \
  playwright-framework bash -c "$CMD"

# Generate Allure report
echo "Generating Allure report..."
npm run report:allure