#!/bin/bash

echo "🛠️  Developer Tools Launcher"

function menu() {
  echo ""
  echo "Choose an action:"
  echo "1 - Run Prettier (format code)"
  echo "2 - Run ESLint (lint check)"
  echo "3 - Run tests (debug mode)"
  echo "4 - Run tests by tag"
  echo "5 - Generate Allure report"
  echo "6 - Exit"
}

while true; do
  menu
  read -p "Enter option [1-6]: " option
  case $option in
    1)
      echo "✨ Formatting code with Prettier..."
      npm run format
      ;;
    2)
      echo "🔍 Running ESLint..."
      npm run lint
      ;;
    3)
      echo "🎯 Running all Playwright tests in debug mode..."
      NODE_ENV=dev npx playwright test --headed --debug
      ;;
    4)
      read -p "Enter tag (e.g., @api, @smoke): " tag
      echo "🔎 Running tests tagged: $tag"
      NODE_ENV=dev npx framework run --tags "$tag"
      ;;
    5)
      echo "📊 Generating Allure report..."
      npx framework generate-report
      ;;
    6)
      echo "👋 Exiting dev tools."
      break
      ;;
    *)
      echo "❌ Invalid option. Try again."
      ;;
  esac
done