/**
 * Performance tests using the PerformanceUtils
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const PerformanceUtils = require('../../utils/performance/performanceUtils');

// Ensure directories exist
const outputDir = './reports/performance';
const traceDir = './traces';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(traceDir)) {
  fs.mkdirSync(traceDir, { recursive: true });
}

test.describe('Performance Tests @performance', () => {
  let perfUtils;
  
  test.beforeEach(async ({ page }) => {
    perfUtils = new PerformanceUtils(page, {
      outputDir: outputDir,
      traceDir: traceDir
    });
  });
  
  test('Page load performance', async ({ page }) => {
    // Use a reliable test site
    const testUrl = 'https://playwright.dev';
    
    // Measure page load performance
    const result = await perfUtils.measurePageLoad(testUrl, {
      screenshot: true,
      trace: true
    });
    
    // Log the results
    console.log(`Page load time: ${result.loadTime}ms`);
    console.log(`TTFB: ${result.timing.ttfb}ms`);
    console.log(`DOM Content Loaded: ${result.timing.domContentLoaded}ms`);
    console.log(`DOM Complete: ${result.timing.domComplete}ms`);
    
    // Assert on performance metrics with more realistic thresholds
    expect(result.loadTime).toBeLessThan(10000, 'Page load time should be less than 10 seconds');
    expect(result.timing.ttfb).toBeLessThan(2000, 'Time to first byte should be less than 2 seconds');
    expect(result.resources.count).toBeLessThan(200, 'Page should have fewer than 200 resources');
  });
  
  test('User interaction performance', async ({ page }) => {
    // Use a reliable test site
    const testUrl = 'https://playwright.dev';
    
    // Navigate to the page
    await page.goto(testUrl);
    
    // Measure interaction performance
    const result = await perfUtils.measureInteraction(async (page) => {
      // Find a reliable element to click (Playwright docs has a GitHub link)
      const githubLink = page.locator('a[href*="github"]').first();
      await githubLink.waitFor({ state: 'visible' });
      await githubLink.click();
      await page.waitForLoadState('networkidle');
    }, {
      name: 'Click navigation',
      screenshot: true,
      trace: true
    });
    
    // Log the results
    console.log(`Interaction duration: ${result.duration}ms`);
    
    // Assert on performance metrics with more realistic thresholds
    expect(result.duration).toBeLessThan(10000, 'Interaction should complete in less than 10 seconds');
  });
  
  test('Run performance test suite', async ({ page }) => {
    // Define test scenarios with reliable test sites
    const scenarios = [
      {
        name: 'Playwright docs homepage',
        type: 'pageLoad',
        url: 'https://playwright.dev',
        options: {
          screenshot: true,
          trace: true
        }
      },
      {
        name: 'Playwright API docs',
        type: 'pageLoad',
        url: 'https://playwright.dev/docs/api/class-playwright',
        options: {
          screenshot: true
        }
      },
      {
        name: 'Navigation interaction',
        type: 'interaction',
        interactionFn: async (page) => {
          await page.goto('https://playwright.dev');
          // Find a reliable element to click
          const docsLink = page.locator('a[href*="docs"]').first();
          await docsLink.waitFor({ state: 'visible' });
          await docsLink.click();
          await page.waitForLoadState('networkidle');
        },
        options: {
          name: 'Navigation',
          trace: true
        }
      }
    ];
    
    // Run the test suite
    const result = await perfUtils.runPerformanceTestSuite(scenarios, {
      name: 'Basic performance suite',
      generateReport: true,
      reportPath: path.join(outputDir, 'performance-report.html')
    });
    
    // Log the results
    console.log(`Test suite duration: ${result.duration}ms`);
    console.log(`Scenarios run: ${result.scenarioCount}`);
    
    // Assert that all scenarios passed
    for (const scenario of result.scenarios) {
      expect(scenario.error).toBeUndefined(`Scenario "${scenario.name}" should not have errors`);
    }
  });
  
  test('Measure page with code coverage', async ({ page }) => {
    // Use a reliable test site
    const testUrl = 'https://playwright.dev';
    
    // Measure page load with code coverage
    const result = await perfUtils.measurePageLoad(testUrl, {
      coverage: true,
      screenshot: true
    });
    
    // Log the coverage results
    if (result.coverage) {
      console.log(`JS usage: ${result.coverage.js.usagePercentage.toFixed(2)}%`);
      console.log(`CSS usage: ${result.coverage.css.usagePercentage.toFixed(2)}%`);
      
      // Assert on code coverage with more realistic thresholds
      expect(result.coverage.js.usagePercentage).toBeGreaterThan(20, 'At least 20% of JS should be used');
      expect(result.coverage.css.usagePercentage).toBeGreaterThan(20, 'At least 20% of CSS should be used');
    }
  });
});