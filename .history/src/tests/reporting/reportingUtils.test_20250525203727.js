/**
 * Tests for the unified reporting utilities
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const os = require('os');
const reportingUtils = require('../../../src/utils/reporting/reportingUtils');

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
  test('should generate HTML report', async () => {
    // Create test results
    const testResults = [
      {
        name: 'Test Suite 1',
        tests: [
          {
            name: 'Test Case 1',
            status: 'passed',
            duration: 1500
          },
          {
            name: 'Test Case 2',
            status: 'failed',
            duration: 2000,
            error: {
              message: 'Expected true to be false',
              stack: 'Error: Expected true to be false\n    at Object.<anonymous>'
            }
          }
        ]
      }
    ];
    
    // Generate report
    const outputPath = path.join(tempDir, 'html-report.html');
    const reportPath = await reportingUtils.generateHtmlReport({
      results: testResults,
      outputFile: 'html-report.html',
      outputDir: tempDir,
      title: 'Test HTML Report'
    });
    
    // Verify report was created
    expect(fs.existsSync(reportPath)).toBeTruthy();
    
    // Verify report content
    const content = fs.readFileSync(reportPath, 'utf8');
    expect(content).toContain('Test HTML Report');
    expect(content).toContain('Test Suite 1');
    expect(content).toContain('Test Case 1');
    expect(content).toContain('Test Case 2');
    expect(content).toContain('Expected true to be false');
  });
  
  test('should generate Markdown report', async () => {
    // Create test results directory with mock data
    const resultsDir = path.join(tempDir, 'test-results');
    fs.mkdirSync(resultsDir, { recursive: true });
    
    // Create mock test results JSON
    const mockResults = {
      suites: [
        {
          title: 'Test Suite',
          specs: [
            {
              title: 'Test Spec',
              tests: [
                {
                  title: 'should pass',
                  status: 'passed',
                  duration: 1000
                },
                {
                  title: 'should fail',
                  status: 'failed',
                  duration: 1500,
                  error: {
                    message: 'Expected failure'
                  }
                }
              ]
            }
          ]
        }
      ]
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'results.json'),
      JSON.stringify(mockResults)
    );
    
    // Generate report
    const reportPath = path.join(tempDir, 'markdown-report.md');
    await reportingUtils.generateMarkdownReport({
      resultsDir,
      reportPath
    });
    
    // Verify report was created
    expect(fs.existsSync(reportPath)).toBeTruthy();
    
    // Verify report content
    const content = fs.readFileSync(reportPath, 'utf8');
    expect(content).toContain('# Test Execution Report');
    expect(content).toContain('Test Suite');
    expect(content).toContain('should pass');
    expect(content).toContain('should fail');
    expect(content).toContain('Expected failure');
  });
  
  test('should generate JUnit XML report', async () => {
    // Create test results directory with mock data
    const resultsDir = path.join(tempDir, 'junit-results');
    fs.mkdirSync(resultsDir, { recursive: true });
    
    // Create mock test results JSON
    const mockResults = {
      suites: [
        {
          title: 'Test Suite',
          specs: [
            {
              title: 'Test Spec',
              tests: [
                {
                  title: 'should pass',
                  status: 'passed',
                  duration: 1000
                },
                {
                  title: 'should fail',
                  status: 'failed',
                  duration: 1500,
                  error: {
                    message: 'Expected failure'
                  }
                }
              ]
            }
          ]
        }
      ]
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'results.json'),
      JSON.stringify(mockResults)
    );
    
    // Generate report
    const reportPath = path.join(tempDir, 'junit-report.xml');
    await reportingUtils.generateJUnitReport({
      resultsDir,
      reportPath
    });
    
    // Verify report was created
    expect(fs.existsSync(reportPath)).toBeTruthy();
    
    // Verify report content
    const content = fs.readFileSync(reportPath, 'utf8');
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(content).toContain('<testsuites>');
    expect(content).toContain('<testsuite name="Test Suite"');
    expect(content).toContain('should pass');
    expect(content).toContain('should fail');
    expect(content).toContain('Expected failure');
  });
  
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