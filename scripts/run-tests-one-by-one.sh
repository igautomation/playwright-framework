#!/bin/bash

# Script to run all tests one by one
# This script will find all test files and run them individually

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Running All Tests One By One ===${NC}"

# Find all test files
echo -e "${BLUE}Finding all test files...${NC}"

# Find Jest unit tests
JEST_TESTS=$(find tests -name "*.test.js")
JEST_TEST_COUNT=$(echo "$JEST_TESTS" | wc -l)

# Find Playwright tests
PLAYWRIGHT_TESTS=$(find src/tests -name "*.spec.js")
PLAYWRIGHT_TEST_COUNT=$(echo "$PLAYWRIGHT_TESTS" | wc -l)

echo -e "${BLUE}Found $JEST_TEST_COUNT Jest tests and $PLAYWRIGHT_TEST_COUNT Playwright tests${NC}"

# Results tracking
JEST_PASSED=0
JEST_FAILED=0
PLAYWRIGHT_PASSED=0
PLAYWRIGHT_FAILED=0

# Run Jest tests one by one
echo -e "\n${YELLOW}=== Running Jest Tests ===${NC}"
for TEST_FILE in $JEST_TESTS; do
  echo -e "${CYAN}Running Jest test: $TEST_FILE${NC}"
  if npx jest "$TEST_FILE" --no-cache; then
    echo -e "${GREEN}✓ Test passed: $TEST_FILE${NC}"
    ((JEST_PASSED++))
  else
    echo -e "${RED}✗ Test failed: $TEST_FILE${NC}"
    ((JEST_FAILED++))
  fi
  echo "" # Add a blank line for readability
done

# Run Playwright tests one by one
echo -e "\n${YELLOW}=== Running Playwright Tests ===${NC}"
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

# Calculate totals
TOTAL_PASSED=$((JEST_PASSED + PLAYWRIGHT_PASSED))
TOTAL_FAILED=$((JEST_FAILED + PLAYWRIGHT_FAILED))
TOTAL_TESTS=$((JEST_TEST_COUNT + PLAYWRIGHT_TEST_COUNT))

# Print summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "${BLUE}Jest Tests: $JEST_PASSED/$JEST_TEST_COUNT passed, $JEST_FAILED failed${NC}"
echo -e "${MAGENTA}Playwright Tests: $PLAYWRIGHT_PASSED/$PLAYWRIGHT_TEST_COUNT passed, $PLAYWRIGHT_FAILED failed${NC}"
echo -e "${YELLOW}Total: $TOTAL_PASSED/$TOTAL_TESTS passed, $TOTAL_FAILED failed${NC}"

# Exit with error code if any tests failed
if [ $TOTAL_FAILED -gt 0 ]; then
  exit 1
fi