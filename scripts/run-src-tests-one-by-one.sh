#!/bin/bash

# Script to run all tests under src/tests directory one by one
# This script will find all test files in src/tests and run them individually

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Running All src/tests Tests One By One ===${NC}"

# Find all test files in src/tests
echo -e "${BLUE}Finding all test files in src/tests...${NC}"

# Find Playwright tests in src/tests
PLAYWRIGHT_TESTS=$(find src/tests -name "*.spec.js")
PLAYWRIGHT_TEST_COUNT=$(echo "$PLAYWRIGHT_TESTS" | wc -l)

echo -e "${BLUE}Found $PLAYWRIGHT_TEST_COUNT Playwright tests in src/tests${NC}"

# Results tracking
PLAYWRIGHT_PASSED=0
PLAYWRIGHT_FAILED=0

# Run Playwright tests one by one
echo -e "\n${YELLOW}=== Running src/tests Playwright Tests ===${NC}"
for TEST_FILE in $PLAYWRIGHT_TESTS; do
  echo -e "${MAGENTA}Running Playwright test: $TEST_FILE${NC}"
  if npx playwright test "$TEST_FILE" --reporter=list; then
    echo -e "${GREEN}✓ Test passed: $TEST_FILE${NC}"
    ((PLAYWRIGHT_PASSED++))
  else
    echo -e "${RED}✗ Test failed: $TEST_FILE${NC}"
    ((PLAYWRIGHT_FAILED++))
  fi
  echo "" # Add a blank line for readability
done

# Print summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "${MAGENTA}Playwright Tests: $PLAYWRIGHT_PASSED/$PLAYWRIGHT_TEST_COUNT passed, $PLAYWRIGHT_FAILED failed${NC}"

# Exit with error code if any tests failed
if [ $PLAYWRIGHT_FAILED -gt 0 ]; then
  exit 1
fi