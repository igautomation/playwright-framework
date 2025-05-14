#!/bin/bash

# Advanced Test Runner Script
# Runs tests folder by folder with modern testing practices and configurable options
set -e

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Default configuration
TEST_DIR="src/tests"
BROWSER="chromium"
HEADLESS=true
WORKERS=1
RETRIES=0
TIMEOUT=30000
REPORTER="list"
GENERATE_REPORT=false
REPORT_DIR="playwright-report"
UPDATE_SNAPSHOTS=false
DEBUG=false
TRACE="on-first-retry"
RECORD_VIDEO="retain-on-failure"
SKIP_FOLDERS=("fixtures" "logs")
SPECIFIC_FOLDER=""
SPECIFIC_TEST=""
VERBOSE=false
QUIET=false
INTERACTIVE=true
SHOW_BROWSER_CONSOLE=false
FAIL_FAST=false
SHARD=""
GLOBAL_TIMEOUT=0
GREP=""
GREP_INVERT=""

# Function to display usage information
show_help() {
  echo -e "${BOLD}Advanced Test Runner for Playwright Framework${NC}"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help                 Show this help message"
  echo "  -b, --browser BROWSER      Browser to use (chromium, firefox, webkit, all) [default: chromium]"
  echo "  -H, --headed               Run in headed mode instead of headless"
  echo "  -w, --workers NUMBER       Number of parallel workers [default: 1]"
  echo "  -r, --retries NUMBER       Number of retries for failed tests [default: 0]"
  echo "  -t, --timeout NUMBER       Timeout in milliseconds [default: 30000]"
  echo "  -R, --reporter REPORTER    Reporter to use (list, dot, line, json, html) [default: list]"
  echo "  -o, --report               Generate HTML report"
  echo "  -d, --report-dir DIR       Directory for the report [default: playwright-report]"
  echo "  -u, --update-snapshots     Update snapshots"
  echo "  -D, --debug                Run in debug mode"
  echo "  --trace MODE               Trace mode (on, off, on-first-retry, on-all-retries) [default: on-first-retry]"
  echo "  --video MODE               Video recording mode (on, off, retain-on-failure) [default: retain-on-failure]"
  echo "  -s, --skip FOLDER          Skip specific folder (can be used multiple times)"
  echo "  -f, --folder FOLDER        Run tests only in specific folder"
  echo "  -T, --test PATTERN         Run only tests matching pattern"
  echo "  -v, --verbose              Verbose output"
  echo "  -q, --quiet                Minimal output"
  echo "  -n, --non-interactive      Run without interactive pauses"
  echo "  -c, --console              Show browser console in output"
  echo "  --fail-fast                Stop after first failure"
  echo "  --shard SHARD              Shard tests and run only the specified shard (e.g., 1/3)"
  echo "  --timeout-global TIMEOUT   Global timeout for the entire test run in milliseconds"
  echo "  --grep PATTERN             Only run tests matching this pattern"
  echo "  --grep-invert PATTERN      Skip tests matching this pattern"
  echo ""
  echo "Examples:"
  echo "  $0 --browser firefox --headed --workers 2"
  echo "  $0 --folder api --reporter html --report"
  echo "  $0 --test \"login.*\" --debug --headed"
  echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -b|--browser)
      BROWSER="$2"
      shift 2
      ;;
    -H|--headed)
      HEADLESS=false
      shift
      ;;
    -w|--workers)
      WORKERS="$2"
      shift 2
      ;;
    -r|--retries)
      RETRIES="$2"
      shift 2
      ;;
    -t|--timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -R|--reporter)
      REPORTER="$2"
      shift 2
      ;;
    -o|--report)
      GENERATE_REPORT=true
      REPORTER="html"
      shift
      ;;
    -d|--report-dir)
      REPORT_DIR="$2"
      shift 2
      ;;
    -u|--update-snapshots)
      UPDATE_SNAPSHOTS=true
      shift
      ;;
    -D|--debug)
      DEBUG=true
      HEADLESS=false
      shift
      ;;
    --trace)
      TRACE="$2"
      shift 2
      ;;
    --video)
      RECORD_VIDEO="$2"
      shift 2
      ;;
    -s|--skip)
      SKIP_FOLDERS+=("$2")
      shift 2
      ;;
    -f|--folder)
      SPECIFIC_FOLDER="$2"
      shift 2
      ;;
    -T|--test)
      SPECIFIC_TEST="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -q|--quiet)
      QUIET=true
      VERBOSE=false
      shift
      ;;
    -n|--non-interactive)
      INTERACTIVE=false
      shift
      ;;
    -c|--console)
      SHOW_BROWSER_CONSOLE=true
      shift
      ;;
    --fail-fast)
      FAIL_FAST=true
      shift
      ;;
    --shard)
      SHARD="$2"
      shift 2
      ;;
    --timeout-global)
      GLOBAL_TIMEOUT="$2"
      shift 2
      ;;
    --grep)
      GREP="$2"
      shift 2
      ;;
    --grep-invert)
      GREP_INVERT="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Build the base Playwright command
build_playwright_command() {
  local folder="$1"
  local cmd="npx playwright test"
  
  # Add the folder to test
  cmd="$cmd \"$folder\""
  
  # Add browser selection
  if [ "$BROWSER" != "all" ]; then
    cmd="$cmd --project=$BROWSER"
  fi
  
  # Add headless/headed mode
  if [ "$HEADLESS" = false ]; then
    cmd="$cmd --headed"
  fi
  
  # Add workers
  cmd="$cmd --workers=$WORKERS"
  
  # Add retries
  cmd="$cmd --retries=$RETRIES"
  
  # Add timeout
  cmd="$cmd --timeout=$TIMEOUT"
  
  # Add reporter
  if [ "$GENERATE_REPORT" = true ]; then
    cmd="$cmd --reporter=html"
  else
    cmd="$cmd --reporter=$REPORTER"
  fi
  
  # Add report directory if generating a report
  if [ "$GENERATE_REPORT" = true ]; then
    cmd="$cmd --output=$REPORT_DIR"
  fi
  
  # Add update snapshots if needed
  if [ "$UPDATE_SNAPSHOTS" = true ]; then
    cmd="$cmd --update-snapshots"
  fi
  
  # Add debug mode if needed
  if [ "$DEBUG" = true ]; then
    cmd="$cmd --debug"
  fi
  
  # Add trace mode
  cmd="$cmd --trace=$TRACE"
  
  # Add video recording mode
  if [ "$RECORD_VIDEO" = "retain-on-failure" ]; then
    cmd="$cmd --video=on"
  else
    cmd="$cmd --video=$RECORD_VIDEO"
  fi
  
  # Add specific test pattern if provided
  if [ -n "$SPECIFIC_TEST" ]; then
    cmd="$cmd --grep=\"$SPECIFIC_TEST\""
  fi
  
  # Add browser console logging if requested
  if [ "$SHOW_BROWSER_CONSOLE" = true ]; then
    cmd="$cmd --browser-console"
  fi
  
  # Add fail-fast option if requested
  if [ "$FAIL_FAST" = true ]; then
    cmd="$cmd --fail-fast"
  fi
  
  # Add sharding if specified
  if [ -n "$SHARD" ]; then
    cmd="$cmd --shard=$SHARD"
  fi
  
  # Add global timeout if specified
  if [ -n "$GLOBAL_TIMEOUT" ] && [ "$GLOBAL_TIMEOUT" -gt 0 ]; then
    cmd="$cmd --global-timeout=$GLOBAL_TIMEOUT"
  fi
  
  # Add grep pattern if specified
  if [ -n "$GREP" ]; then
    cmd="$cmd --grep=\"$GREP\""
  fi
  
  # Add grep-invert pattern if specified
  if [ -n "$GREP_INVERT" ]; then
    cmd="$cmd --grep-invert=\"$GREP_INVERT\""
  fi
  
  echo "$cmd"
}

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

# Function to print test results
print_results() {
  local total="$1"
  local passed="$2"
  local failed="$3"
  local skipped="$4"
  
  echo -e "\n${BOLD}Test Results:${NC}"
  echo -e "  ${BLUE}Total: $total${NC}"
  echo -e "  ${GREEN}Passed: $passed${NC}"
  
  if [ "$failed" -gt 0 ]; then
    echo -e "  ${RED}Failed: $failed${NC}"
  else
    echo -e "  Failed: 0"
  fi
  
  if [ "$skipped" -gt 0 ]; then
    echo -e "  ${YELLOW}Skipped: $skipped${NC}"
  else
    echo -e "  Skipped: 0"
  fi
}

# Start the test run
print_header "Advanced Test Runner"

# Display configuration
if [ "$QUIET" = false ]; then
  echo -e "${BOLD}Configuration:${NC}"
  echo -e "  Browser: ${CYAN}$BROWSER${NC}"
  echo -e "  Mode: ${CYAN}$([ "$HEADLESS" = true ] && echo "Headless" || echo "Headed")${NC}"
  echo -e "  Workers: ${CYAN}$WORKERS${NC}"
  echo -e "  Retries: ${CYAN}$RETRIES${NC}"
  echo -e "  Reporter: ${CYAN}$REPORTER${NC}"
  
  if [ -n "$SPECIFIC_FOLDER" ]; then
    echo -e "  Running only folder: ${CYAN}$SPECIFIC_FOLDER${NC}"
  fi
  
  if [ -n "$SPECIFIC_TEST" ]; then
    echo -e "  Test pattern: ${CYAN}$SPECIFIC_TEST${NC}"
  fi
  
  echo ""
fi

# Get the test folders
if [ -n "$SPECIFIC_FOLDER" ]; then
  if [ -d "$TEST_DIR/$SPECIFIC_FOLDER" ]; then
    TEST_FOLDERS=("$TEST_DIR/$SPECIFIC_FOLDER")
  else
    echo -e "${RED}Error: Specified folder '$SPECIFIC_FOLDER' not found in $TEST_DIR${NC}"
    exit 1
  fi
else
  # Get all immediate subdirectories in the test directory
  # Using a more portable approach instead of mapfile
  TEST_FOLDERS=()
  while IFS= read -r dir; do
    TEST_FOLDERS+=("$dir")
  done < <(find "$TEST_DIR" -maxdepth 1 -type d | grep -v "^$TEST_DIR$" | sort)
  
  # Add the root test directory to run tests directly in src/tests/
  TEST_FOLDERS+=("$TEST_DIR")
fi

# Results tracking
TOTAL_PASSED=0
TOTAL_FAILED=0
TOTAL_SKIPPED=0
TOTAL_FOLDERS=0
PROCESSED_FOLDERS=0

# Run tests folder by folder
for FOLDER in "${TEST_FOLDERS[@]}"; do
  FOLDER_NAME=$(basename "$FOLDER")
  
  # Check if this folder should be skipped
  if should_skip_folder "$FOLDER"; then
    if [ "$QUIET" = false ] && [ "$VERBOSE" = true ]; then
      echo -e "${BLUE}Skipping folder: $FOLDER${NC}"
    fi
    ((TOTAL_SKIPPED++))
    continue
  fi
  
  ((TOTAL_FOLDERS++))
  
  # Count tests in this folder
  TEST_COUNT=$(find "$FOLDER" -name "*.spec.js" | wc -l | tr -d ' ')
  
  if [ "$TEST_COUNT" -eq 0 ]; then
    if [ "$QUIET" = false ]; then
      echo -e "${BLUE}No tests found in $FOLDER${NC}"
    fi
    ((TOTAL_SKIPPED++))
    continue
  fi
  
  ((PROCESSED_FOLDERS++))
  
  # Print folder header
  if [ "$QUIET" = false ]; then
    print_header "Running Tests in: $FOLDER_NAME"
    echo -e "${BLUE}Found $TEST_COUNT test files${NC}"
  fi
  
  # Build and execute the Playwright command
  COMMAND=$(build_playwright_command "$FOLDER")
  
  if [ "$VERBOSE" = true ]; then
    echo -e "${CYAN}Executing: $COMMAND${NC}\n"
  fi
  
  # Run the tests
  if eval "$COMMAND"; then
    if [ "$QUIET" = false ]; then
      echo -e "\n${GREEN}✓ All tests passed in: $FOLDER${NC}"
    fi
    ((TOTAL_PASSED++))
  else
    if [ "$QUIET" = false ]; then
      echo -e "\n${RED}✗ Some tests failed in: $FOLDER${NC}"
    fi
    ((TOTAL_FAILED++))
    
    # Exit if fail-fast is enabled
    if [ "$FAIL_FAST" = true ]; then
      echo -e "${YELLOW}Stopping test run due to failures (--fail-fast enabled)${NC}"
      break
    fi
  fi
  
  # Interactive pause between folders
  if [ "$INTERACTIVE" = true ] && [ "$PROCESSED_FOLDERS" -lt "${#TEST_FOLDERS[@]}" ]; then
    read -p "Press Enter to continue to the next folder or Ctrl+C to exit..."
  fi
  
  echo "" # Add a blank line for readability
done

# Print final summary
print_header "Test Summary"
echo -e "${BLUE}Folders Processed: $PROCESSED_FOLDERS / $TOTAL_FOLDERS${NC}"
echo -e "${GREEN}Folders with All Tests Passed: $TOTAL_PASSED${NC}"

if [ "$TOTAL_FAILED" -gt 0 ]; then
  echo -e "${RED}Folders with Some Tests Failed: $TOTAL_FAILED${NC}"
else
  echo -e "Folders with Some Tests Failed: 0"
fi

if [ "$TOTAL_SKIPPED" -gt 0 ]; then
  echo -e "${YELLOW}Folders Skipped: $TOTAL_SKIPPED${NC}"
else
  echo -e "Folders Skipped: 0"
fi

# If HTML report was generated, show the path
if [ "$GENERATE_REPORT" = true ]; then
  echo -e "\n${CYAN}HTML report generated at: $REPORT_DIR${NC}"
  echo -e "You can open it with: npx playwright show-report $REPORT_DIR"
fi

# Exit with error code if any folder had failing tests
if [ "$TOTAL_FAILED" -gt 0 ]; then
  exit 1
fi