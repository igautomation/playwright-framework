#!/bin/bash

echo "Bootstrapping framework environment..."

# Step 1: Node.js check
echo "Checking Node.js..."
node -v

# Step 2: Install npm dependencies
echo "Installing NPM dependencies..."
npm ci

# Step 3: Install Husky
echo "Setting up Husky..."
npx husky install
echo "Husky hooks initialized"

# Step 4: Check Allure CLI
echo "Checking Allure CLI..."
allure --version || echo "Allure CLI not found. Please install it manually."

# Step 5: Validate required .env
if [ -f .env ]; then
  echo ".env already exists"
else
  cp .env.example .env
  echo "Created .env from example"
fi

# Step 6: Add Git ignore rules for sandbox and logs
GITIGNORE=".gitignore"
if ! grep -q "sandbox/" "$GITIGNORE"; then
  echo "" >> "$GITIGNORE"
  echo "# Sandbox" >> "$GITIGNORE"
  echo "sandbox/" >> "$GITIGNORE"
  echo "sandbox/*.log" >> "$GITIGNORE"
  echo "sandbox/*.tmp" >> "$GITIGNORE"
  echo "sandbox/.env" >> "$GITIGNORE"
  echo "Added sandbox rules to .gitignore"
fi
if ! grep -q "src/logs/" "$GITIGNORE"; then
  echo "" >> "$GITIGNORE"
  echo "# Logs" >> "$GITIGNORE"
  echo "src/logs/" >> "$GITIGNORE"
  echo "Added logs rule to .gitignore"
fi

# Step 7: Move frontend demo files to sandbox
mkdir -p sandbox
mv App.tsx sandbox/ 2>/dev/null
mv main.tsx sandbox/ 2>/dev/null
mv index.css sandbox/ 2>/dev/null
mv vite-env.d.ts sandbox/ 2>/dev/null
echo "Moved frontend demo files to sandbox"

# Step 8: Clean up unused files
rm -f src/cli/commands/xray-results.json
rm -f src/tests/data/dataProviders.spec.js
rm -f src/tests/ui/e2e/fully-parameterized-e2e.spec.js
rm -f .DS_Store
rm -f src/logs/*.log
find . -name '.DS_Store' -type f -delete
echo "Removed unused test files and log files"

# Step 9: Remove empty folders
rmdir src/templates 2>/dev/null
rmdir src/tests/hybrid 2>/dev/null
rmdir src/tests/ui/e2e 2>/dev/null
echo "Cleaned up empty folders"

# Completion
echo "Bootstrap complete. You can now run:"
echo "npx framework run --tags \"@api\""

# Step 10: Run a sample test
echo "Running smoke test to validate setup..."
npx framework run --tags "@smoke" --project=chromium --workers=1 || echo "Smoke test failed. Check output."

# Step 11: Generate Allure report
echo "Generating Allure report..."
npx framework generate-report || echo "Failed to generate Allure report"

# Step 12: Show report path
echo "You can open the Allure report at: reports/allure-report/index.html"

# Step 13: Automatically open test reports
open_report() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$1"
  elif command -v xdg-open &>/dev/null; then
    xdg-open "$1"
  elif grep -q Microsoft /proc/version 2>/dev/null; then
    wslview "$1"
  else
    echo "Could not auto-open $1. Please open it manually."
  fi
}

echo "Checking and opening Allure report..."
if [ -f reports/allure-report/index.html ]; then
  open_report "reports/allure-report/index.html"
else
  echo "Allure report not found"
fi

echo "Checking and opening Playwright HTML report..."
if [ -f playwright-report/index.html ]; then
  open_report "playwright-report/index.html"
else
  echo "Playwright HTML report not found"
fi