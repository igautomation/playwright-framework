#!/usr/bin/env node

/**
 * Script to create a distributable bundle of the Playwright framework
 * This can be run locally without GitHub Actions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const version = process.argv[2] || '1.0.0';
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log(`Creating Playwright Framework bundle v${version}...`);

// Create dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Create sample project structure
console.log('Creating sample project structure...');
const sampleDir = path.join(distDir, 'sample-project');
fs.mkdirSync(path.join(sampleDir, 'tests'), { recursive: true });
fs.mkdirSync(path.join(sampleDir, 'pages'), { recursive: true });
fs.mkdirSync(path.join(sampleDir, 'fixtures'), { recursive: true });
fs.mkdirSync(path.join(sampleDir, 'utils'), { recursive: true });
fs.mkdirSync(path.join(sampleDir, 'reports'), { recursive: true });

// Create sample test file
fs.writeFileSync(path.join(sampleDir, 'tests', 'sample-test.spec.js'), `
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';

test.describe('Sample Test Suite', () => {
  test('should navigate to homepage', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.assertPageLoaded();
  });
});
`);

// Create sample page object
fs.writeFileSync(path.join(sampleDir, 'pages', 'home-page.js'), `
export class HomePage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }
  
  async navigate() {
    await this.page.goto(process.env.BASE_URL || 'https://example.com');
  }
  
  async assertPageLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }
}
`);

// Create sample fixture
fs.writeFileSync(path.join(sampleDir, 'fixtures', 'test-data.json'), `
{
  "users": [
    {
      "username": "testuser",
      "password": "password123"
    }
  ],
  "endpoints": {
    "api": "https://api.example.com"
  }
}
`);

// Create sample .env file
fs.writeFileSync(path.join(sampleDir, '.env.example'), `
# Web Configuration
BASE_URL=https://example.com

# API Configuration
API_URL=https://api.example.com
API_KEY=your_api_key

# Test Configuration
HEADLESS=true
BROWSER=chromium
`);

// Create sample playwright config
fs.writeFileSync(path.join(sampleDir, 'playwright.config.js'), `
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  reporter: [['html'], ['json', { outputFile: 'reports/test-results.json' }]],
  use: {
    baseURL: process.env.BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
`);

// Create README
fs.writeFileSync(path.join(sampleDir, 'README.md'), `
# Playwright Test Framework - Sample Project

This is a sample project demonstrating how to use the Playwright Test Framework.

## Setup

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Install browsers:
   \`\`\`
   npx playwright install
   \`\`\`

3. Copy the environment file:
   \`\`\`
   cp .env.example .env
   \`\`\`
   Then edit the \`.env\` file with your configuration.

## Running Tests

\`\`\`
npx playwright test
\`\`\`

## Viewing Reports

\`\`\`
npx playwright show-report
\`\`\`
`);

// Create package.json
fs.writeFileSync(path.join(sampleDir, 'package.json'), `
{
  "name": "playwright-framework-sample",
  "version": "1.0.0",
  "description": "Sample project using Playwright Test Framework",
  "scripts": {
    "test": "playwright test",
    "report": "playwright show-report"
  },
  "dependencies": {
    "playwright-framework": "file:../framework"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "dotenv": "^16.3.1"
  }
}
`);

// Prepare framework bundle
console.log('Preparing framework bundle...');
const frameworkDir = path.join(distDir, 'framework');
fs.mkdirSync(path.join(frameworkDir, 'lib'), { recursive: true });
fs.mkdirSync(path.join(frameworkDir, 'bin'), { recursive: true });

// Copy essential framework files
try {
  execSync(`cp -r ${path.join(rootDir, 'src/utils')} ${path.join(frameworkDir, 'lib/')}`);
  execSync(`cp -r ${path.join(rootDir, 'src/helpers')} ${path.join(frameworkDir, 'lib/')}`);
  execSync(`cp -r ${path.join(rootDir, 'src/core')} ${path.join(frameworkDir, 'lib/')}`);
} catch (error) {
  console.log('Warning: Some source directories may not exist. Creating placeholder structure.');
  fs.mkdirSync(path.join(frameworkDir, 'lib/utils'), { recursive: true });
  fs.mkdirSync(path.join(frameworkDir, 'lib/helpers'), { recursive: true });
  fs.mkdirSync(path.join(frameworkDir, 'lib/core'), { recursive: true });
}

// Create package.json for the framework
fs.writeFileSync(path.join(frameworkDir, 'package.json'), `
{
  "name": "playwright-framework",
  "version": "${version}",
  "description": "Comprehensive Playwright testing framework",
  "main": "lib/index.js",
  "bin": {
    "pw-framework": "./bin/cli.js"
  },
  "scripts": {
    "postinstall": "node bin/setup.js"
  },
  "dependencies": {
    "@playwright/test": "^1.40.0",
    "dotenv": "^16.3.1",
    "chalk": "^4.1.2",
    "commander": "^11.1.0",
    "winston": "^3.11.0"
  }
}
`);

// Create CLI tool
fs.writeFileSync(path.join(frameworkDir, 'bin/cli.js'), `
#!/usr/bin/env node
const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

program
  .version(require('../package.json').version)
  .description('Playwright Framework CLI');

program
  .command('init')
  .description('Initialize a new test project')
  .action(() => {
    console.log('Creating new test project...');
    const sampleDir = path.join(__dirname, '../sample');
    const targetDir = process.cwd();
    
    // Copy sample files
    fs.cpSync(sampleDir, targetDir, { recursive: true });
    console.log('Project initialized successfully!');
  });

program.parse(process.argv);
`);

// Create setup script
fs.writeFileSync(path.join(frameworkDir, 'bin/setup.js'), `
#!/usr/bin/env node
console.log('Setting up Playwright Framework...');
console.log('Installation complete! Run "npx pw-framework init" to create a new project.');
`);

// Make scripts executable
fs.chmodSync(path.join(frameworkDir, 'bin/cli.js'), '755');
fs.chmodSync(path.join(frameworkDir, 'bin/setup.js'), '755');

// Create index.js
fs.writeFileSync(path.join(frameworkDir, 'lib/index.js'), `
// Export framework components
module.exports = {
  utils: require('./utils'),
  helpers: require('./helpers'),
  core: require('./core')
};
`);

// Copy sample project to framework for easy initialization
fs.mkdirSync(path.join(frameworkDir, 'sample'), { recursive: true });
execSync(`cp -r ${sampleDir}/* ${path.join(frameworkDir, 'sample/')}`);

// Create installation script
console.log('Creating installation script...');
fs.writeFileSync(path.join(distDir, 'install.sh'), `
#!/bin/bash

echo "Installing Playwright Framework..."

# Install the framework
npm install --global ./framework

# Create a new project if requested
if [ "$1" == "--create-project" ]; then
  PROJECT_NAME=\${2:-"playwright-project"}
  echo "Creating new project: $PROJECT_NAME"
  
  mkdir -p "$PROJECT_NAME"
  cd "$PROJECT_NAME"
  
  # Initialize project
  npx pw-framework init
  
  echo "Project created successfully!"
  echo "To get started:"
  echo "  cd $PROJECT_NAME"
  echo "  npm install"
  echo "  npx playwright install"
else
  echo "Framework installed successfully!"
  echo "To create a new project, run: npx pw-framework init"
fi
`);

fs.chmodSync(path.join(distDir, 'install.sh'), '755');

// Package the bundle
console.log('Packaging the bundle...');
try {
  execSync(`cd ${distDir} && zip -r "playwright-framework-${version}.zip" ./*`);
  console.log(`Bundle created: ${path.join(distDir, `playwright-framework-${version}.zip`)}`);
} catch (error) {
  console.error('Failed to create zip file. Please install zip utility or manually zip the dist directory.');
}

console.log('Bundle creation complete!');