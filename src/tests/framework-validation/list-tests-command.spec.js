/**
 * @fileoverview Tests for the list-tests command functionality
 */
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const path = require('path');

test.describe('List Tests Command', () => {
  test('should list tests without running them', async () => {
    // Execute the list-tests command and capture the output
    const output = execSync('node src/cli/index.js list-tests', { 
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '../../../')
    });
    
    // Verify the output contains expected content
    expect(output).toContain('Listing tests with options');
    expect(output).toContain('Executing command: npx playwright test --list');
  });
  
  test('should list tests with project filter', async () => {
    // Execute the list-tests command with project filter and capture the output
    const output = execSync('node src/cli/index.js list-tests --project=chromium', { 
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '../../../')
    });
    
    // Verify the output contains expected content
    expect(output).toContain('Listing tests with options');
    expect(output).toContain('Executing command: npx playwright test --list --project="chromium"');
  });
  
  test('should list tests with tag filter', async () => {
    // Execute the list-tests command with tag filter and capture the output
    const output = execSync('node src/cli/index.js list-tests --tags="@smoke"', { 
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '../../../')
    });
    
    // Verify the output contains expected content
    expect(output).toContain('Listing tests with options');
    expect(output).toContain('Executing command: npx playwright test --list --grep "@smoke"');
  });
});