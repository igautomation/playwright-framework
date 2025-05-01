#!/bin/bash

echo "🚀 Running cleanup..."

# Step 1: Move demo/frontend files to sandbox
mkdir -p sandbox
mv App.tsx sandbox/ 2>/dev/null
mv main.tsx sandbox/ 2>/dev/null
mv index.css sandbox/ 2>/dev/null
mv vite-env.d.ts sandbox/ 2>/dev/null
echo "✔ Moved frontend demo files to sandbox/"

# Step 2: Remove unused or outdated files
rm -f src/cli/commands/xray-results.json
rm -f src/tests/data/dataProviders.spec.js
rm -f src/tests/ui/e2e/fully-parameterized-e2e.spec.js
rm -f .DS_Store
rm -f src/logs/*.log
find . -name '.DS_Store' -type f -delete
echo "✔ Removed unused test files, .DS_Store, and log files"

# Step 3: Remove empty folders if present
rmdir src/templates 2>/dev/null
rmdir src/tests/hybrid 2>/dev/null
rmdir src/tests/ui/e2e 2>/dev/null
echo "✔ Cleaned up empty template/test folders"

# Step 4: Update .gitignore to exclude sandbox and logs
GITIGNORE=".gitignore"
if ! grep -q "sandbox/" "$GITIGNORE"; then
  echo -e "\n# Sandbox (ignored from Git)\nsandbox/\nsandbox/*.log\nsandbox/*.tmp\nsandbox/.env\n" >> "$GITIGNORE"
  echo "✔ Added sandbox rules to .gitignore"
fi

if ! grep -q "logs/" "$GITIGNORE"; then
  echo -e "\n# Logs\nsrc/logs/" >> "$GITIGNORE"
  echo "✔ Added log rules to .gitignore"
fi

echo "✅ Cleanup complete."
