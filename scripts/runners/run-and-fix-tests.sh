#!/bin/bash

# Script to run tests folder by folder and fix failures
# This script will find all test folders and run tests in each folder separately

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${YELLOW}=== Running Tests Folder by Folder and Fixing Failures ===${NC}"

# Define the base test directory
TEST_DIR="src/tests"

# Define folders to skip (fixtures and logs are helper folders, not test folders)
SKIP_FOLDERS=("fixtures" "logs")

# Get all immediate subdirectories in the test directory
mapfile -t TEST_FOLDERS < <(find "$TEST_DIR" -maxdepth 1 -type d | grep -v "^$TEST_DIR$" | sort)

# Add the root test directory to run tests directly in src/tests/
TEST_FOLDERS+=("$TEST_DIR")

# Results tracking
TOTAL_PASSED=0
TOTAL_FAILED=0
TOTAL_FIXED=0
TOTAL_FOLDERS=0

# Function to check if a folder should be skipped
should_skip_folder() {
  local folder="$1"
  local folder_name=$(basename "$folder")
  
  for skip in "${SKIP_FOLDERS[@]}"; do
    if [[ "$folder_name" == "$skip" ]]; then
      return 0 # True, should skip
    fi
  done
  
  return 1 # False, should not skip
}

# Function to print section header
print_header() {
  local title="$1"
  local width=80
  local padding=$(( (width - ${#title} - 4) / 2 ))
  local line=$(printf '%*s' "$width" | tr ' ' '=')
  
  echo -e "\n${YELLOW}$line${NC}"
  printf "${YELLOW}%*s %s %*s${NC}\n" $padding "" "$title" $padding ""
  echo -e "${YELLOW}$line${NC}\n"
}

# Run tests folder by folder
for FOLDER in "${TEST_FOLDERS[@]}"; do
  FOLDER_NAME=$(basename "$FOLDER")
  
  # Check if this folder should be skipped
  if should_skip_folder "$FOLDER"; then
    echo -e "${BLUE}Skipping helper folder: $FOLDER${NC}"
    continue
  fi

  ((TOTAL_FOLDERS++))
  
  # Count tests in this folder
  TEST_COUNT=$(find "$FOLDER" -name "*.spec.js" | wc -l | tr -d ' ')
  
  if [ "$TEST_COUNT" -eq 0 ]; then
    echo -e "${BLUE}No tests found in $FOLDER${NC}"
    continue
  fi
  
  # Print folder header
  print_header "Running Tests in: $FOLDER_NAME"
  echo -e "${BLUE}Found $TEST_COUNT test files${NC}"
  
  # Run the tests in this folder with minimal workers to better identify issues
  if npx playwright test "$FOLDER" --workers=1 --reporter=list; then
    echo -e "\n${GREEN}✓ All tests passed in: $FOLDER${NC}"
    ((TOTAL_PASSED++))
  else
    echo -e "\n${RED}✗ Some tests failed in: $FOLDER${NC}"
    ((TOTAL_FAILED++))
    
    # Ask if user wants to fix the failures
    read -p "Do you want to attempt to fix the failures in this folder? (y/n): " fix_choice
    
    if [[ "$fix_choice" == "y" || "$fix_choice" == "Y" ]]; then
      echo -e "${CYAN}Running tests in debug mode to help identify issues...${NC}"
      
      # Run with headed mode and slower execution to help identify issues
      if npx playwright test "$FOLDER" --debug; then
        echo -e "${GREEN}✓ Tests now pass after debugging!${NC}"
        ((TOTAL_FIXED++))
      else
        echo -e "${YELLOW}Tests still failing. You may need to manually fix the issues.${NC}"
        
        # List the failing test files for reference
        echo -e "${CYAN}Failing test files in $FOLDER:${NC}"
        npx playwright test "$FOLDER" --list --reporter=line
        
        # Offer to open the HTML report if available
        if [ -d "playwright-report" ]; then
          read -p "Do you want to open the HTML report to see detailed failures? (y/n): " report_choice
          if [[ "$report_choice" == "y" || "$report_choice" == "Y" ]]; then
            npx playwright show-report
          fi
        fi
      fi
    fi
  fi
  
  # Ask user if they want to continue to the next folder
  read -p "Press Enter to continue to the next folder or Ctrl+C to exit..."
  
  echo "" # Add a blank line for readability
done

# Print final summary
print_header "Test Summary"
echo -e "${BLUE}Folders Processed: $TOTAL_FOLDERS${NC}"
echo -e "${GREEN}Folders with All Tests Passed: $TOTAL_PASSED${NC}"
echo -e "${RED}Folders with Some Tests Failed: $TOTAL_FAILED${NC}"
echo -e "${CYAN}Folders Fixed During Run: $TOTAL_FIXED${NC}"

# Exit with error code if any folder had failing tests that weren't fixed
if [ $(($TOTAL_FAILED - $TOTAL_FIXED)) -gt 0 ]; then
  echo -e "${YELLOW}Some test folders still have failures that need to be addressed.${NC}"
  exit 1
else
  echo -e "${GREEN}All test folders are now passing!${NC}"
  exit 0
fi