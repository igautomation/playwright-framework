#!/bin/bash

# Script to run tests folder by folder sequentially
# This script will find all test folders and run tests in each folder one after another

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Running Tests Folder by Folder Sequentially ===${NC}"

# Define the base test directory
TEST_DIR="src/tests"

# Get all immediate subdirectories in the test directory
TEST_FOLDERS=$(find $TEST_DIR -maxdepth 1 -type d | grep -v "^$TEST_DIR$" | sort)

# Results tracking
TOTAL_PASSED=0
TOTAL_FAILED=0
TOTAL_FOLDERS=0

# Run tests folder by folder
for FOLDER in $TEST_FOLDERS; do
  # Skip the fixtures folder as it contains helper files, not tests
  if [[ "$FOLDER" == *"fixtures"* || "$FOLDER" == *"logs"* ]]; then
    echo -e "${BLUE}Skipping helper folder: $FOLDER${NC}"
    continue
  fi

  ((TOTAL_FOLDERS++))
  FOLDER_NAME=$(basename "$FOLDER")
  
  echo -e "\n${YELLOW}=== Running Tests in: $FOLDER ===${NC}"
  
  # Count tests in this folder
  TEST_COUNT=$(find "$FOLDER" -name "*.spec.js" | wc -l)
  
  if [ "$TEST_COUNT" -eq 0 ]; then
    echo -e "${BLUE}No tests found in $FOLDER${NC}"
    continue
  fi
  
  echo -e "${BLUE}Found $TEST_COUNT test files${NC}"
  
  # Run the tests in this folder
  if npx playwright test "$FOLDER" --reporter=list; then
    echo -e "${GREEN}✓ All tests passed in: $FOLDER${NC}"
    ((TOTAL_PASSED++))
  else
    echo -e "${RED}✗ Some tests failed in: $FOLDER${NC}"
    ((TOTAL_FAILED++))
  fi
  
  # Ask user if they want to continue to the next folder
  read -p "Press Enter to continue to the next folder or Ctrl+C to exit..."
  
  echo "" # Add a blank line for readability
done

# Also run tests directly in the root test directory
echo -e "\n${YELLOW}=== Running Tests in root directory: $TEST_DIR ===${NC}"
ROOT_TEST_COUNT=$(find "$TEST_DIR" -maxdepth 1 -name "*.spec.js" | wc -l)

if [ "$ROOT_TEST_COUNT" -gt 0 ]; then
  ((TOTAL_FOLDERS++))
  echo -e "${BLUE}Found $ROOT_TEST_COUNT test files in root directory${NC}"
  
  # Run the tests in the root directory
  if npx playwright test "$TEST_DIR" --testDir="$TEST_DIR" --testMatch="*.spec.js" --reporter=list; then
    echo -e "${GREEN}✓ All tests passed in root directory: $TEST_DIR${NC}"
    ((TOTAL_PASSED++))
  else
    echo -e "${RED}✗ Some tests failed in root directory: $TEST_DIR${NC}"
    ((TOTAL_FAILED++))
  fi
else
  echo -e "${BLUE}No tests found in root directory${NC}"
fi

# Print summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "${BLUE}Folders Processed: $TOTAL_FOLDERS${NC}"
echo -e "${GREEN}Folders with All Tests Passed: $TOTAL_PASSED${NC}"
echo -e "${RED}Folders with Some Tests Failed: $TOTAL_FAILED${NC}"

# Exit with error code if any folder had failing tests
if [ $TOTAL_FAILED -gt 0 ]; then
  exit 1
fi