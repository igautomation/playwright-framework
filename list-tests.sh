#!/bin/bash

# Script to list all available tests without running them

# Display help message
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  echo "Usage: ./list-tests.sh [options]"
  echo ""
  echo "Options:"
  echo "  --project=<project>   List tests for specific project"
  echo "  --tags=<tags>         Filter tests by tags"
  echo "  --help, -h            Display this help message"
  echo ""
  exit 0
fi

# Build the command
COMMAND="npx playwright test --list"

# Process arguments
for arg in "$@"; do
  case $arg in
    --project=*)
      PROJECT="${arg#*=}"
      COMMAND="$COMMAND --project=\"$PROJECT\""
      ;;
    --tags=*)
      TAGS="${arg#*=}"
      COMMAND="$COMMAND --grep=\"$TAGS\""
      ;;
  esac
done

# Display the command being executed
echo "Executing: $COMMAND"

# Execute the command
eval $COMMAND

# Exit with the same status as the command
exit $?