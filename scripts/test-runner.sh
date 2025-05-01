#!/bin/bash

echo "Test Runner - Playwright CLI Wrapper"

# Default values
NODE_ENV="dev"
TAGS="@smoke"
PROJECT="chromium"
RETRIES=0
WORKERS=auto

# Prompt for override values
read -p "Enter NODE_ENV (dev, qa, prod) [default: dev]: " input_env
read -p "Enter test tag (e.g., @api, @regression) [default: @smoke]: " input_tag
read -p "Enter browser project (chromium, firefox, webkit) [default: chromium]: " input_project
read -p "Enter retry count [default: 0]: " input_retries
read -p "Enter worker count [default: auto]: " input_workers

# Use user inputs if provided
NODE_ENV=${input_env:-$NODE_ENV}
TAGS=${input_tag:-$TAGS}
PROJECT=${input_project:-$PROJECT}
RETRIES=${input_retries:-$RETRIES}
WORKERS=${input_workers:-$WORKERS}

echo ""
echo "Configuration:"
echo "  NODE_ENV: $NODE_ENV"
echo "  TAGS: $TAGS"
echo "  PROJECT: $PROJECT"
echo "  RETRIES: $RETRIES"
echo "  WORKERS: $WORKERS"
echo ""

# Run the test with constructed command
echo "Executing test run..."
NODE_ENV=$NODE_ENV npx dotenv -e .env -- npx framework run \
  --tags "$TAGS" \
  --project "$PROJECT" \
  --retries "$RETRIES" \
  --workers "$WORKERS"