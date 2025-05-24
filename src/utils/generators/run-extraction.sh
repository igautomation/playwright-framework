#!/bin/bash
# Salesforce DOM Element Extraction Script

# Default values
ORG_ALIAS="my-org-alias"
TARGET_URL=""
SELECTORS="lightning-input,lightning-button,.slds-input,.slds-button"
OUTPUT_FILE="sf_elements.json"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --org|-o)
      ORG_ALIAS="$2"
      shift 2
      ;;
    --url|-u)
      TARGET_URL="$2"
      shift 2
      ;;
    --selectors|-s)
      SELECTORS="$2"
      shift 2
      ;;
    --output|-f)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    --help|-h)
      echo "Salesforce DOM Element Extraction Script"
      echo ""
      echo "Usage:"
      echo "  ./run-extraction.sh [options]"
      echo ""
      echo "Options:"
      echo "  --org, -o <alias>     Salesforce org alias (default: $ORG_ALIAS)"
      echo "  --url, -u <url>       Target Salesforce URL"
      echo "  --selectors, -s       Comma-separated list of CSS selectors"
      echo "  --output, -f <file>   Output file path (default: $OUTPUT_FILE)"
      echo "  --help, -h            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Export environment variables for the Node.js script
export SF_ORG_ALIAS="$ORG_ALIAS"
export SF_TARGET_URL="$TARGET_URL"
export SF_SELECTORS="$SELECTORS"
export SF_OUTPUT_FILE="$OUTPUT_FILE"

# Check if Salesforce CLI is installed
if ! command -v sf &> /dev/null; then
  echo "Error: Salesforce CLI (sf) is not installed"
  echo "Please install it from: https://developer.salesforce.com/tools/sfdxcli"
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "Warning: jq is not installed. Session ID extraction may fail."
  echo "Install jq using:"
  echo "  - macOS: brew install jq"
  echo "  - Linux: sudo apt-get install jq"
  echo "  - Windows: Download from https://stedolan.github.io/jq/download/"
fi

# Retrieve session ID
echo "Checking authentication status for org: $ORG_ALIAS"
if ! sf org display -o "$ORG_ALIAS" &> /dev/null; then
  echo "Not authenticated. Initiating login..."
  sf org login web -r https://login.salesforce.com -a "$ORG_ALIAS"
  
  if [ $? -ne 0 ]; then
    echo "Error: Authentication failed"
    exit 1
  fi
fi

# Run the extraction script
echo "Extracting DOM elements..."
node "$(dirname "$0")/sf-session-extractor.js"

# Check if extraction was successful
if [ $? -eq 0 ]; then
  echo "DOM extraction completed successfully"
  echo "Results saved to: $OUTPUT_FILE"
else
  echo "Error: DOM extraction failed"
  exit 1
fi