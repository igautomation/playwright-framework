#!/bin/bash

# Salesforce Page Generation Workflow Script
# This script automates the process of generating Salesforce page objects and tests

# Default values
PAGE_NAME="SalesforceTestPage"
OUTPUT_DIR="./src/pages"
TEST_DIR="./tests/pages"

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --name) PAGE_NAME="$2"; shift ;;
        --output) OUTPUT_DIR="$2"; shift ;;
        --test-dir) TEST_DIR="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo "🚀 Starting Salesforce page generation workflow"
echo "Page name: $PAGE_NAME"
echo "Output directory: $OUTPUT_DIR"
echo "Test directory: $TEST_DIR"

# Ensure directories exist
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEST_DIR"

# Create a simple page object file
cat > "$OUTPUT_DIR/$PAGE_NAME.js" << EOL
/**
 * $PAGE_NAME Page Object
 * Represents a Salesforce page with common interactions
 */
class $PAGE_NAME {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page
   */
  constructor(page) {
    this.page = page;
    
    // Define selectors
    this.selectors = {
      header: 'h1.slds-page-header__title',
      newButton: 'button[name="New"], a[title="New"]',
      saveButton: 'button[name="SaveEdit"]',
      cancelButton: 'button[name="CancelEdit"]',
      searchBox: 'input[placeholder*="Search"]',
    };
  }

  /**
   * Navigate to this page
   */
  async navigate() {
    // This is a placeholder - replace with actual navigation logic
    await this.page.goto(process.env.SF_INSTANCE_URL + '/lightning/o/Contact/list');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click the New button
   */
  async clickNew() {
    await this.page.click(this.selectors.newButton);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Fill a form field
   * @param {string} fieldName - The field name/label
   * @param {string} value - The value to enter
   */
  async fillField(fieldName, value) {
    // Try multiple approaches to find and fill the field
    try {
      // Try by label
      await this.page.getByLabel(fieldName).fill(value);
    } catch (error) {
      // Try by placeholder
      await this.page.locator(\`input[placeholder*="\${fieldName}"]\`).fill(value);
    }
  }

  /**
   * Save the form
   */
  async save() {
    await this.page.click(this.selectors.saveButton);
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = $PAGE_NAME;
EOL

# Create a simple test file
cat > "$TEST_DIR/$PAGE_NAME.spec.js" << EOL
const { test, expect } = require('@playwright/test');
const $PAGE_NAME = require('../src/pages/$PAGE_NAME');

test.describe('$PAGE_NAME Tests', () => {
  test('should load the page', async ({ page }) => {
    // Create page object
    const pageObject = new $PAGE_NAME(page);
    
    // Navigate to page
    await pageObject.navigate();
    
    // Verify page loaded
    await expect(page).toHaveTitle(/Salesforce/);
  });
});
EOL

# Create a dummy elements file for demonstration
cat > "./sf_elements.json" << EOL
{
  "$PAGE_NAME": {
    "header": "h1.slds-page-header__title",
    "newButton": "button[name='New'], a[title='New']",
    "saveButton": "button[name='SaveEdit']",
    "cancelButton": "button[name='CancelEdit']",
    "searchBox": "input[placeholder*='Search']"
  }
}
EOL

echo "✅ Successfully generated page object and test for $PAGE_NAME"
echo "📄 Page object: $OUTPUT_DIR/$PAGE_NAME.js"
echo "🧪 Test file: $TEST_DIR/$PAGE_NAME.spec.js"
echo "🔍 Elements file: ./sf_elements.json"

# Take a screenshot of the error if the script fails
if [ $? -ne 0 ]; then
  echo "❌ Error occurred during page generation"
  npx playwright screenshot --url="about:blank" --path="error-screenshot.png" --full-page
  exit 1
fi

exit 0