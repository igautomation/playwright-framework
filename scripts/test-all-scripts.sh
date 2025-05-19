#!/bin/bash

# Script to test all scripts in the scripts directory
echo "Testing all scripts in the scripts directory..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Directory containing the scripts
SCRIPTS_DIR=$(dirname "$0")
cd "$SCRIPTS_DIR"

# Arrays to track results
PASSED=()
FAILED=()
SKIPPED=()

# Function to test if a script is executable
test_script() {
  local script="$1"
  local script_name=$(basename "$script")
  
  # Skip the current test script
  if [[ "$script_name" == "test-all-scripts.sh" ]]; then
    SKIPPED+=("$script_name - Skipped (current test script)")
    return
  fi
  
  echo -e "${YELLOW}Testing $script_name...${NC}"
  
  # Check if script is executable
  if [[ ! -x "$script" ]]; then
    echo -e "${RED}$script_name is not executable${NC}"
    FAILED+=("$script_name - Not executable")
    return
  fi
  
  # For shell scripts, just check syntax
  if [[ "$script" == *.sh ]]; then
    if bash -n "$script"; then
      echo -e "${GREEN}$script_name - Syntax OK${NC}"
      PASSED+=("$script_name - Syntax OK")
    else
      echo -e "${RED}$script_name - Syntax Error${NC}"
      FAILED+=("$script_name - Syntax Error")
    fi
  # For JavaScript files, check syntax with node
  elif [[ "$script" == *.js ]]; then
    if node --check "$script"; then
      echo -e "${GREEN}$script_name - Syntax OK${NC}"
      PASSED+=("$script_name - Syntax OK")
    else
      echo -e "${RED}$script_name - Syntax Error${NC}"
      FAILED+=("$script_name - Syntax Error")
    fi
  else
    echo -e "${YELLOW}$script_name - Unknown file type, skipping${NC}"
    SKIPPED+=("$script_name - Unknown file type")
  fi
}

# Test all scripts
echo "Testing shell scripts..."
for script in *.sh; do
  test_script "$script"
done

echo "Testing JavaScript scripts..."
for script in *.js; do
  test_script "$script"
done

# Print summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "${GREEN}Passed: ${#PASSED[@]}${NC}"
echo -e "${RED}Failed: ${#FAILED[@]}${NC}"
echo -e "${YELLOW}Skipped: ${#SKIPPED[@]}${NC}"

# Print details if there are failures
if [ ${#FAILED[@]} -gt 0 ]; then
  echo -e "\n${RED}Failed Scripts:${NC}"
  for script in "${FAILED[@]}"; do
    echo -e "  - $script"
  done
  exit 1
fi

echo -e "\n${GREEN}All scripts passed syntax checking!${NC}"
exit 0