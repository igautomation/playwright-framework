#!/bin/bash
# Salesforce Page Object Generation Workflow

# Default values
ORG_ALIAS="my-org-alias"
TARGET_URL="https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new"
PAGE_NAME="ContactPage"
USERNAME="altimetrikuser001@wise-koala-a44c19.com"
PASSWORD="Dubai@2025"
OUTPUT_DIR="./src/pages"
TEST_OUTPUT_DIR="./tests/pages"

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
    --name|-n)
      PAGE_NAME="$2"
      shift 2
      ;;
    --username)
      USERNAME="$2"
      shift 2
      ;;
    --password)
      PASSWORD="$2"
      shift 2
      ;;
    --output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --test-dir)
      TEST_OUTPUT_DIR="$2"
      shift 2
      ;;
    --help|-h)
      echo "Salesforce Page Object Generation Workflow"
      echo ""
      echo "Usage:"
      echo "  ./run-sf-workflow.sh [options]"
      echo ""
      echo "Options:"
      echo "  --org, -o <alias>     Salesforce org alias (default: $ORG_ALIAS)"
      echo "  --url, -u <url>       Target Salesforce URL (default: $TARGET_URL)"
      echo "  --name, -n <name>     Page class name (default: $PAGE_NAME)"
      echo "  --username <username> Salesforce username"
      echo "  --password <password> Salesforce password"
      echo "  --output-dir <dir>    Output directory for page classes (default: $OUTPUT_DIR)"
      echo "  --test-dir <dir>      Output directory for test classes (default: $TEST_OUTPUT_DIR)"
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

# Create output directories if they don't exist
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEST_OUTPUT_DIR"

# Step 1: Extract DOM elements
echo "Step 1: Extracting DOM elements from $TARGET_URL"
node src/utils/generators/test-sf-extraction.js
if [ $? -ne 0 ]; then
  echo "Error: DOM extraction failed"
  exit 1
fi

# Step 2: Generate page class
echo "Step 2: Generating page class $PAGE_NAME"
node src/utils/generators/sf-page-generator.js --input sf_contact_elements.json --output "$OUTPUT_DIR" --test-output "$TEST_OUTPUT_DIR" --name "$PAGE_NAME" --url "$TARGET_URL"
if [ $? -ne 0 ]; then
  echo "Error: Page class generation failed"
  exit 1
fi

echo "Workflow completed successfully!"
echo "Generated files:"
echo "- Page class: $OUTPUT_DIR/$PAGE_NAME.js"
echo "- Test class: $TEST_OUTPUT_DIR/$PAGE_NAME.spec.js"