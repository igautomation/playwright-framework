#!/bin/bash

echo "🧪 Framework Test Run: Full Execution Flow"

# Step 1: Run ESLint
echo "🔍 Running lint check..."
npm run lint || { echo "❌ Lint failed. Fix issues and re-run."; exit 1; }

# Step 2: Run Prettier format check
echo "✨ Checking formatting..."
npm run format:check || { echo "❌ Format check failed. Run 'npm run format' to fix."; exit 1; }

# Step 3: Ask for tag (optional)
read -p "Enter test tag (e.g., @api, @smoke). Leave blank to run all: " TAGS

# Build test run command
CMD="npx framework run"
if [ -n "$TAGS" ]; then
  CMD="$CMD --tags \"$TAGS\""
fi

echo "🚀 Executing: $CMD"
eval $CMD || { echo "❌ Tests failed."; exit 1; }

# Step 4: Generate Allure report
echo "📊 Generating Allure report..."
npx framework generate-report || { echo "❌ Allure generation failed."; exit 1; }

# Step 5: Optional webhook notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  echo "📣 Sending Slack notification..."
  node -e "import('./src/utils/reporting/reportUtils.js').then(m => m.default.sendNotification({
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    message: '✅ Playwright test suite completed. Allure report generated.'
  }));"
else
  echo "ℹ️ SLACK_WEBHOOK_URL not set. Skipping notification."
fi

echo "✅ Framework test run complete."