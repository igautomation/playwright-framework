#!/bin/bash

echo "Running cleanup..."

# Step 1: Move demo/frontend files to sandbox
mkdir -p sandbox
mv App.tsx sandbox/ 2>/dev/null
mv main.tsx sandbox/ 2>/dev/null
mv index.css sandbox/ 2>/dev/null
mv vite-env.d.ts sandbox/ 2>/dev/null
echo "Moved frontend demo files to sandbox"

# Step 2: Remove unused or outdated files
rm -f src/cli/commands/xray-results.json
rm -f src/tests/data/dataProviders.spec.js
rm -f src/tests/ui/e2e/fully-parameterized-e2e.spec.js
rm -f .DS_Store
rm -f src/logs/*.log
find . -name '.DS_Store' -type f -delete
echo "Removed unused test files and log files"

# Step 3: Remove empty folders if present
find src/templates -type d -empty -delete 2>/dev/null
find src/tests/hybrid -type d -empty -delete 2>/dev/null
find src/tests/ui/e2e -type d -empty -delete 2>/dev/null
echo "Cleaned up empty folders"

# Step 4: Update .gitignore
GITIGNORE=".gitignore"

append_gitignore_if_missing() {
  local pattern="$1"
  local comment="$2"
  if ! grep -q "$pattern" "$GITIGNORE"; then
    echo "" >> "$GITIGNORE"
    echo "# $comment" >> "$GITIGNORE"
    echo "$pattern" >> "$GITIGNORE"
    echo "Added $pattern to .gitignore"
  fi
}

append_gitignore_if_missing "sandbox/" "Sandbox directory"
append_gitignore_if_missing "sandbox/*.log" "Sandbox logs"
append_gitignore_if_missing "sandbox/*.tmp" "Sandbox temp files"
append_gitignore_if_missing "sandbox/.env" "Sandbox environment files"
append_gitignore_if_missing "src/logs/" "Log directory"

echo "Cleanup complete."