#!/usr/bin/env node

/**
 * Page Object Generator CLI
 * Unified entry point for page object generation
 */
const { generatePageObject } = require('./page-generator');
const config = require('./config');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  url: null,
  name: null,
  outputPath: config.output.pagesDir,
  headless: true,
  auth: null,
  isSalesforce: false,
  includeCollections: config.extraction.extractCollections,
  generateTests: false
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' || args[i] === '-u') {
    options.url = args[i + 1];
    i++;
  } else if (args[i] === '--name' || args[i] === '-n') {
    options.name = args[i + 1];
    i++;
  } else if (args[i] === '--output' || args[i] === '-o') {
    options.outputPath = args[i + 1];
    i++;
  } else if (args[i] === '--visible' || args[i] === '-v') {
    options.headless = false;
  } else if (args[i] === '--username') {
    options.auth = options.auth || {};
    options.auth.username = args[i + 1];
    i++;
  } else if (args[i] === '--password') {
    options.auth = options.auth || {};
    options.auth.password = args[i + 1];
    i++;
  } else if (args[i] === '--salesforce' || args[i] === '-sf') {
    options.isSalesforce = true;
  } else if (args[i] === '--no-collections') {
    options.includeCollections = false;
  } else if (args[i] === '--generate-tests' || args[i] === '-t') {
    options.generateTests = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Page Object Generator

Usage:
  node generate-page.js [options]

Options:
  --url, -u <url>         URL to generate page object from
  --name, -n <name>       Name of the page class
  --output, -o <path>     Output directory (default: ${config.output.pagesDir})
  --visible, -v           Run in visible browser mode
  --username <username>   Username for authentication
  --password <password>   Password for authentication
  --salesforce, -sf       Generate Salesforce-specific page object
  --no-collections        Don't include DOM collection methods
  --generate-tests, -t    Generate test files
  --help, -h              Show this help message
    `);
    process.exit(0);
  }
}

// Validate required options
if (!options.url) {
  console.error('Error: URL is required');
  process.exit(1);
}

if (!options.name) {
  // Generate name from URL
  const urlObj = new URL(options.url.startsWith('http') ? options.url : `http://example.com${options.url}`);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  options.name = pathParts.length > 0 
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1) + 'Page'
    : 'HomePage';
}

// Run generator
(async () => {
  try {
    const result = await generatePageObject(options);
    console.log(`Successfully generated ${result.className} at ${result.filePath}`);
    
    if (result.testFilePath) {
      console.log(`Successfully generated tests at ${result.testFilePath}`);
    }
  } catch (error) {
    console.error('Error generating page object:', error);
    process.exit(1);
  }
})();