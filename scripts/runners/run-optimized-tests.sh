#!/bin/bash

# Script to run tests with optimized settings
echo "Running optimized tests..."

# Parse command line arguments
WORKERS=4
PROJECTS="chromium"
GREP="@fast"
SHARD=""
HEADED=false

# Process arguments
for arg in "$@"; do
  case $arg in
    --workers=*)
      WORKERS="${arg#*=}"
      ;;
    --project=*)
      PROJECTS="${arg#*=}"
      ;;
    --grep=*)
      GREP="${arg#*=}"
      ;;
    --shard=*)
      SHARD="${arg#*=}"
      ;;
    --headed)
      HEADED=true
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --workers=N       Number of parallel workers (default: 4)"
      echo "  --project=NAME    Project to run (default: chromium)"
      echo "  --grep=PATTERN    Only run tests matching pattern (default: @fast)"
      echo "  --shard=N/M       Run tests in shard N of M"
      echo "  --headed          Run in headed mode"
      echo "  --help            Display this help message"
      exit 0
      ;;
  esac
done

# Build the command
CMD="npx playwright test --workers=$WORKERS --project=$PROJECTS --grep=\"$GREP\""

# Add shard if specified
if [ -n "$SHARD" ]; then
  CMD="$CMD --shard=$SHARD"
fi

# Add headed mode if specified
if [ "$HEADED" = true ]; then
  CMD="$CMD --headed"
fi

# Display the command
echo "Executing: $CMD"

# Run the tests
eval $CMD

# Exit with the same status as the command
exit $?