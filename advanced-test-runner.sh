#!/bin/bash

# Advanced Test Runner Script
# This script provides a comprehensive set of options to customize your test runs

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
BROWSER="chromium"
HEADED=false
WORKERS=""
RETRIES=""
REPORT=false
REPORTER="list"
REPORT_DIR="playwright-report"
DEBUG=false
TRACE="on-first-retry"
VIDEO="retain-on-failure"
FOLDER=""
TEST_PATTERN=""
INTERACTIVE=true
UPDATE_SNAPSHOTS=false
SHARD=""
GREP=""
GREP_INVERT=""
TIMEOUT=""
TIMEOUT_GLOBAL=""
SHOW_CONSOLE=false
FAIL_FAST=false
VERBOSE=false
QUIET=false
SKIP_FOLDERS=()

# Function to display help message
function show_help {
  echo -e "${YELLOW}Advanced Test Runner${NC}"
  echo -e "Usage: $0 [options]"
  echo ""
  echo -e "Options:"
  echo -e "  --browser BROWSER       Browser to use: chromium, firefox, webkit, or all (default: chromium)"
  echo -e "  --headed                Run tests in headed mode (with browser UI visible)"
  echo -e "  --workers NUMBER        Number of parallel workers (default: from playwright.config.js)"
  echo -e "  --retries NUMBER        Number of retries for failed tests (default: from playwright.config.js)"
  echo -e "  --report                Generate HTML report"
  echo -e "  --reporter REPORTER     Reporter to use: list, dot, line, json, html (default: list)"
  echo -e "  --report-dir DIR        Directory for the report (default: playwright-report)"
  echo -e "  --debug                 Run in debug mode (slower execution with browser UI)"
  echo -e "  --trace MODE            Trace mode: on, off, on-first-retry, on-all-retries (default: on-first-retry)"
  echo -e "  --video MODE            Video mode: on, off, retain-on-failure (default: retain-on-failure)"
  echo -e "  --folder FOLDER         Run tests only in the specified folder"
  echo -e "  --test PATTERN          Run tests matching the pattern"
  echo -e "  --non-interactive       Run without pausing between folders"
  echo -e "  --update-snapshots      Update snapshots for visual regression tests"
  echo -e "  --shard SHARD           Shard tests, e.g., 1/3 (run shard 1 of 3)"
  echo -e "  --grep PATTERN          Run tests with name matching the pattern"
  echo -e "  --grep-invert PATTERN   Skip tests with name matching the pattern"
  echo -e "  --timeout MS            Timeout for each test in milliseconds"
  echo -e "  --timeout-global MS     Timeout for the entire test run in milliseconds"
  echo -e "  --console               Show browser console logs in test output"
  echo -e "  --fail-fast             Stop after first failure"
  echo -e "  --verbose               Show verbose output"
  echo -e "  --quiet                 Show minimal output"
  echo -e "  --skip FOLDER           Skip the specified folder (can be used multiple times)"
  echo -e "  --help                  Show this help message"
  echo ""
  echo -e "Examples:"
  echo -e "  $0 --browser firefox --folder api --report"
  echo -e "  $0 --test \"login\" --debug"
  echo -e "  $0 --browser all --workers 4 --retries 2 --report --non-interactive"
  echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --browser)
      BROWSER="$2"
      shift
      shift
      ;;
    --headed)
      HEADED=true
      shift
      ;;
    --workers)
      WORKERS="$2"
      shift
      shift
      ;;
    --retries)
      RETRIES="$2"
      shift
      shift
      ;;
    --report)
      REPORT=true
      shift
      ;;
    --reporter)
      REPORTER="$2"
      shift
      shift
      ;;
    --report-dir)
      REPORT_DIR="$2"
      shift
      shift
      ;;
    --debug)
      DEBUG=true
      HEADED=true
      shift
      ;;
    --trace)
      TRACE="$2"
      shift
      shift
      ;;
    --video)
      VIDEO="$2"
      shift
      shift
      ;;
    --folder)
      FOLDER="$2"
      shift
      shift
      ;;
    --test)
      TEST_PATTERN="$2"
      shift
      shift
      ;;
    --non-interactive)
      INTERACTIVE=false
      shift
      ;;
    --update-snapshots)
      UPDATE_SNAPSHOTS=true
      shift
      ;;
    --shard)
      SHARD="$2"
      shift
      shift
      ;;
    --grep)
      GREP="$2"
      shift
      shift
      ;;
    --grep-invert)
      GREP_INVERT="$2"
      shift
      shift
      ;;
    --timeout)
      TIMEOUT="$2"
      shift
      shift
      ;;
    --timeout-global)
      TIMEOUT_GLOBAL="$2"
      shift
      shift
      ;;
    --console)
      SHOW_CONSOLE=true
      shift
      ;;
    --fail-fast)
      FAIL_FAST=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --quiet)
      QUIET=true
      shift
      ;;
    --skip)
      SKIP_FOLDERS+=("$2")
      shift
      shift
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $key${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Function to check if a folder should be skipped
function should_skip_folder {
  local folder_name="$1"
  
  # Skip helper folders by default
  if [[ "$folder_name" == "fixtures" || "$folder_name" == "logs" || "$folder_name" == "helpers" || "$folder_name" == "utils" ]]; then
    return 0
  fi
  
  # Check if folder is in the skip list
  for skip_folder in "${SKIP_FOLDERS[@]}"; do
    if [[ "$folder_name" == "$skip_folder" ]]; then
      return 0
    fi
  done
  
  return 1
}

# Function to build the Playwright command
function build_playwright_command {
  local cmd="npx playwright test"
  
  # Add test pattern if specified
  if [[ -n "$TEST_PATTERN" ]]; then
    cmd="$cmd \"$TEST_PATTERN\""
  fi
  
  # Add browser if specified
  if [[ "$BROWSER" != "all" ]]; then
    cmd="$cmd --project=$BROWSER"
  fi
  
  # Add headed mode if specified
  if [[ "$HEADED" == true ]]; then
    cmd="$cmd --headed"
  fi
  
  # Add workers if specified
  if [[ -n "$WORKERS" ]]; then
    cmd="$cmd --workers=$WORKERS"
  fi
  
  # Add retries if specified
  if [[ -n "$RETRIES" ]]; then
    cmd="$cmd --retries=$RETRIES"
  fi
  
  # Add reporter if specified
  if [[ "$REPORT" == true || "$REPORTER" != "list" ]]; then
    cmd="$cmd --reporter=$REPORTER"
  fi
  
  # Add report directory if specified
  if [[ "$REPORT" == true && "$REPORT_DIR" != "playwright-report" ]]; then
    cmd="$cmd --output=$REPORT_DIR"
  fi
  
  # Add debug mode if specified
  if [[ "$DEBUG" == true ]]; then
    cmd="$cmd --debug"
  fi
  
  # Add trace mode if specified
  if [[ -n "$TRACE" ]]; then
    cmd="$cmd --trace=$TRACE"
  fi
  
  # Add video mode if specified
  if [[ -n "$VIDEO" ]]; then
    cmd="$cmd --video=$VIDEO"
  fi
  
  # Add update snapshots if specified
  if [[ "$UPDATE_SNAPSHOTS" == true ]]; then
    cmd="$cmd --update-snapshots"
  fi
  
  # Add shard if specified
  if [[ -n "$SHARD" ]]; then
    cmd="$cmd --shard=$SHARD"
  fi
  
  # Add grep if specified
  if [[ -n "$GREP" ]]; then
    cmd="$cmd --grep=\"$GREP\""
  fi
  
  # Add grep invert if specified
  if [[ -n "$GREP_INVERT" ]]; then
    cmd="$cmd --grep-invert=\"$GREP_INVERT\""
  fi
  
  # Add timeout if specified
  if [[ -n "$TIMEOUT" ]]; then
    cmd="$cmd --timeout=$TIMEOUT"
  fi
  
  # Add global timeout if specified
  if [[ -n "$TIMEOUT_GLOBAL" ]]; then
    cmd="$cmd --timeout-global=$TIMEOUT_GLOBAL"
  fi
  
  # Add console if specified
  if [[ "$SHOW_CONSOLE" == true ]]; then
    cmd="$cmd --console"
  fi
  
  # Add fail-fast if specified
  if [[ "$FAIL_FAST" == true ]]; then
    cmd="$cmd --fail-fast"
  fi
  
  # Add quiet if specified
  if [[ "$QUIET" == true ]]; then
    cmd="$cmd --quiet"
  fi
  
  echo "$cmd"
}

# Main execution
echo -e "${YELLOW}=== Advanced Test Runner ===${NC}"

# Make all shell scripts in the scripts directory executable
echo -e "${BLUE}Making all shell scripts executable...${NC}"
chmod +x /workspace/scripts/*.sh
echo -e "${GREEN}All shell scripts are now executable.${NC}"

# Find test folders
TEST_DIR="/workspace/src/tests"
if [[ -n "$FOLDER" ]]; then
  # If a specific folder is specified, only run tests in that folder
  TEST_FOLDERS=("$FOLDER")
else
  # Otherwise, find all test folders
  echo -e "${BLUE}Finding test folders...${NC}"
  TEST_FOLDERS=()
  for dir in "$TEST_DIR"/*; do
    if [[ -d "$dir" ]]; then
      folder_name=$(basename "$dir")
      if ! should_skip_folder "$folder_name"; then
        TEST_FOLDERS+=("$folder_name")
      fi
    fi
  done
fi

# Sort folders alphabetically
IFS=$'\n' TEST_FOLDERS=($(sort <<<"${TEST_FOLDERS[*]}"))
unset IFS

echo -e "${BLUE}Found ${#TEST_FOLDERS[@]} test folders: ${TEST_FOLDERS[*]}${NC}"

# Results tracking
PASSED_FOLDERS=()
FAILED_FOLDERS=()
SKIPPED_FOLDERS=()

# Run tests in each folder
for folder in "${TEST_FOLDERS[@]}"; do
  echo -e "\n${YELLOW}=== Running tests in folder: $folder ===${NC}"
  
  # Count test files in the folder
  if [[ -d "$TEST_DIR/$folder" ]]; then
    TEST_FILES=$(find "$TEST_DIR/$folder" -name "*.spec.js" | wc -l)
    echo -e "${BLUE}Found $TEST_FILES test files in $folder${NC}"
    
    # Build the command
    if [[ -n "$TEST_PATTERN" ]]; then
      # If a test pattern is specified, use it
      CMD=$(build_playwright_command)
      CMD="$CMD \"$TEST_DIR/$folder/**/$TEST_PATTERN\""
    else
      # Otherwise, run all tests in the folder
      CMD=$(build_playwright_command)
      CMD="$CMD \"$TEST_DIR/$folder\""
    fi
    
    # Print the command if verbose
    if [[ "$VERBOSE" == true ]]; then
      echo -e "${CYAN}Running command: $CMD${NC}"
    fi
    
    # Run the tests
    echo -e "${MAGENTA}Running tests in $folder...${NC}"
    if eval "$CMD"; then
      echo -e "${GREEN}✓ All tests in $folder passed${NC}"
      PASSED_FOLDERS+=("$folder")
    else
      echo -e "${RED}✗ Some tests in $folder failed${NC}"
      FAILED_FOLDERS+=("$folder")
      
      # Exit if fail-fast is enabled
      if [[ "$FAIL_FAST" == true ]]; then
        echo -e "${RED}Stopping due to --fail-fast option${NC}"
        break
      fi
    fi
    
    # Pause if interactive mode is enabled
    if [[ "$INTERACTIVE" == true ]]; then
      echo -e "${YELLOW}Press Enter to continue to the next folder...${NC}"
      read -r
    fi
  else
    echo -e "${RED}Folder $folder not found${NC}"
    SKIPPED_FOLDERS+=("$folder")
  fi
done

# Print summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "${GREEN}Passed folders (${#PASSED_FOLDERS[@]}): ${PASSED_FOLDERS[*]}${NC}"
echo -e "${RED}Failed folders (${#FAILED_FOLDERS[@]}): ${FAILED_FOLDERS[*]}${NC}"
if [[ ${#SKIPPED_FOLDERS[@]} -gt 0 ]]; then
  echo -e "${BLUE}Skipped folders (${#SKIPPED_FOLDERS[@]}): ${SKIPPED_FOLDERS[*]}${NC}"
fi

# Generate report if requested
if [[ "$REPORT" == true ]]; then
  echo -e "\n${YELLOW}=== Test Report ===${NC}"
  echo -e "${BLUE}Test report is available at: $REPORT_DIR${NC}"
  echo -e "${BLUE}Open the report with: npx playwright show-report $REPORT_DIR${NC}"
fi

# Exit with error code if any tests failed
if [[ ${#FAILED_FOLDERS[@]} -gt 0 ]]; then
  exit 1
fi