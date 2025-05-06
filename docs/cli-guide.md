# Web Scraping CLI Guide

This guide explains how to use the command-line interface (CLI) for web scraping in the Playwright framework.

## Installation

The CLI tool is included with the framework. Make sure you have all dependencies installed:

```bash
npm install
```

## Basic Usage

The CLI tool provides various commands for different scraping tasks:

```bash
node src/cli/scrape.js [command] [options]
```

## Available Commands

### Extract Table Data

Extract data from an HTML table:

```bash
node src/cli/scrape.js table https://example.com "table.products"
```

### Extract Links

Extract links from a page:

```bash
node src/cli/scrape.js links https://example.com
```

With custom selector:

```bash
node src/cli/scrape.js links https://example.com "nav a.menu-item"
```

### Extract Text

Extract text content from elements:

```bash
node src/cli/scrape.js text https://example.com "p.description"
```

### Extract Structured Data

Extract structured data using multiple selectors:

```bash
node src/cli/scrape.js structured https://example.com '{"title": "h1.title", "price": ".product-price", "description": "p.description"}'
```

### Extract Metadata

Extract metadata from a page:

```bash
node src/cli/scrape.js metadata https://example.com
```

### Extract Images

Extract images from a page:

```bash
node src/cli/scrape.js images https://example.com
```

Download the images:

```bash
node src/cli/scrape.js images https://example.com --download
```

### Save DOM Snapshot

Save a DOM snapshot of a page:

```bash
node src/cli/scrape.js snapshot https://example.com "product-page"
```

Without styles:

```bash
node src/cli/scrape.js snapshot https://example.com "product-page" --no-styles
```

With minification:

```bash
node src/cli/scrape.js snapshot https://example.com "product-page" --minify
```

### Compare Snapshots

Compare two DOM snapshots:

```bash
node src/cli/scrape.js compare "snapshots/snapshot1.html" "snapshots/snapshot2.html"
```

### Extract Form Data

Extract form data from a page:

```bash
node src/cli/scrape.js form https://example.com "#contact-form"
```

## Common Options

All commands support the following options:

| Option | Description | Default |
|--------|-------------|---------|
| `-h, --headless` | Run in headless mode | `true` |
| `-t, --timeout <ms>` | Navigation timeout in milliseconds | `30000` |
| `-w, --wait <ms>` | Wait time after page load in milliseconds | `0` |
| `-o, --output <path>` | Output file path | Auto-generated |
| `-f, --format <format>` | Output format (json or csv) | `json` |
| `--data-dir <path>` | Data directory for saving results | `./data/extracted` |

## Examples

### Extract product data and save as CSV

```bash
node src/cli/scrape.js table https://example.com/products "#products-table" -f csv -o products.csv
```

### Extract metadata with longer wait time

```bash
node src/cli/scrape.js metadata https://example.com -w 5000
```

### Extract images in non-headless mode

```bash
node src/cli/scrape.js images https://example.com --no-headless
```

### Save snapshot with custom directory

```bash
node src/cli/scrape.js snapshot https://example.com "homepage" --snapshot-dir ./my-snapshots
```

## Automation Examples

### Scheduled scraping with cron

Create a shell script:

```bash
#!/bin/bash
cd /path/to/playwright-framework
node src/cli/scrape.js table https://example.com/products "#products-table" -o "products-$(date +%Y-%m-%d).json"
```

Add to crontab to run daily:

```
0 8 * * * /path/to/script.sh
```

### Batch processing multiple URLs

Create a file `urls.txt` with one URL per line, then:

```bash
#!/bin/bash
while read url; do
  node src/cli/scrape.js metadata "$url" -o "metadata-$(echo $url | sed 's/[^a-zA-Z0-9]/-/g').json"
done < urls.txt
```

## Troubleshooting

### Timeout errors

If you're experiencing timeout errors, try increasing the timeout and wait time:

```bash
node src/cli/scrape.js table https://example.com "table.products" -t 60000 -w 5000
```

### Selector not found

If your selector isn't finding elements, try running in non-headless mode to see what's happening:

```bash
node src/cli/scrape.js table https://example.com "table.products" --no-headless
```