#!/bin/bash

echo "📤 Xray Integration: Generate and Push Results"

# Step 1: Prompt for the Xray Test Execution Key
read -p "Enter Xray Test Execution Key (e.g., XRAY-123): " TEST_EXEC_KEY

if [ -z "$TEST_EXEC_KEY" ]; then
  echo "❌ Test Execution Key is required. Exiting."
  exit 1
fi

# Step 2: Generate results file using the result generator
echo "🛠 Generating result JSON..."
node src/utils/xray/xrayResultsGenerator.js

# Step 3: Push results to Xray
echo "🚀 Pushing results to Xray..."
npx framework push-to-xray "$TEST_EXEC_KEY" --results "$XRAY_OUTPUT_PATH"

echo "✅ Xray result flow complete."
