/**
 * Tests for the unified reporting utilities
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const os = require('os');
const reportingUtils = require('../../utils/reporting/reportingUtils');

// Create temp directory for test artifacts
const tempDir = path.join(os.tmpdir(), `playwright-reporting-tests-${Date.now()}`);

// Setup and teardown
test.beforeAll(() => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
});

test.afterAll(() => {
  // Clean up temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test.describe('Reporting Utilities', () => {
  test('should process Playwright results', async () => {
    // Create mock Playwright results
    const playwrightResults = {
      suites: [
        {
          title: 'Test Suite',
          specs: [
            {
              title: 'Test Spec',
              tests: [
                {
                  title: 'Test Case',
                  status: 'passed',
                  duration: 1000,
                  attachments: [
                    {
                      name: 'screenshot',
                      path: path.join(tempDir, 'screenshot.png'),
                      contentType: 'image/png'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
    
    // Create mock screenshot
    fs.writeFileSync(path.join(tempDir, 'screenshot.png'), 'mock image data');
    
    // Process results
    const processedResults = reportingUtils.processPlaywrightResults(playwrightResults);
    
    // Verify processed results
    expect(processedResults).toHaveLength(1);
    expect(processedResults[0].name).toBe('Test Suite');
    expect(processedResults[0].tests).toHaveLength(1);
    expect(processedResults[0].tests[0].name).toBe('Test Case');
    expect(processedResults[0].tests[0].status).toBe('passed');
    expect(processedResults[0].tests[0].screenshots).toHaveLength(1);
  });
});