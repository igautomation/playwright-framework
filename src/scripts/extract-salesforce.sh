#!/bin/bash

# Default values
SELECTOR="h1"
SESSION_FILE="sf-session.json"

# Help text
show_help() {
  echo "Usage: $0 -u username -p password -l url [-s selector]"
  echo
  echo "Options:"
  echo "  -u, --username    Salesforce username"
  echo "  -p, --password    Salesforce password"
  echo "  -l, --url        Target URL to extract elements from"
  echo "  -s, --selector   CSS selector (default: h1)"
  echo "  -h, --help       Show this help"
  exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--username) USERNAME="$2"; shift 2 ;;
    -p|--password) PASSWORD="$2"; shift 2 ;;
    -l|--url) URL="$2"; shift 2 ;;
    -s|--selector) SELECTOR="$2"; shift 2 ;;
    -h|--help) show_help ;;
    *) echo "Unknown option: $1"; show_help ;;
  esac
done

# Validate required arguments
if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ] || [ -z "$URL" ]; then
  echo "Error: username, password and url are required"
  show_help
fi

# Run the Node.js script
node "$(dirname "$0")/salesforce-dom-extractor.js" \
  --username "$USERNAME" \
  --password "$PASSWORD" \
  --url "$URL" \
  --selector "$SELECTOR"