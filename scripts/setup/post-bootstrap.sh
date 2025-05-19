#!/bin/bash

echo "Post-bootstrap: Open reports if available"

# Function to open report in the default browser based on OS
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

ALLURE_PATH="reports/allure-report/index.html"
HTML_PATH="playwright-report/index.html"

if [ -f "$ALLURE_PATH" ]; then
  echo "Opening Allure report..."
  open_report "$ALLURE_PATH"
else
  echo "Allure report not found at $ALLURE_PATH"
fi

if [ -f "$HTML_PATH" ]; then
  echo "Opening Playwright HTML report..."
  open_report "$HTML_PATH"
else
  echo "Playwright report not found at $HTML_PATH"
fi

echo "Post-bootstrap complete"
