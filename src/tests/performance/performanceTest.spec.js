/**
 * Performance tests using the PerformanceUtils
 */
const { test, expect } = require('@playwright/test');
const PerformanceUtils = require('../../utils/performance/performanceUtils');

test.describe('Performance Tests @performance', () => {
  let perfUtils;
  
  test.beforeEach(async ({ page }) => {
    perfUtils = new PerformanceUtils(page, {
      outputDir: './reports/performance',
      traceDir: './traces'
    });
  });
  
  test('Page load performance', async ({ page }) => {
    // Measure page load performance
    const result = await perfUtils.measurePageLoad('https://example.com', {
      screenshot: true,
      trace: true
    });
    
    // Log the results
    console.log(`Page load time: ${result.loadTime}ms`);
    console.log(`TTFB: ${result.timing.ttfb}ms`);
    console.log(`DOM Content Loaded: ${result.timing.domContentLoaded}ms`);
    console.log(`DOM Complete: ${result.timing.domComplete}ms`);
    
    // Assert on performance metrics
    expect(result.loadTime).toBeLessThan(5000, 'Page load time should be less than 5 seconds');
    expect(result.timing.ttfb).toBeLessThan(1000, 'Time to first byte should be less than 1 second');
    expect(result.resources.count).toBeLessThan(100, 'Page should have fewer than 100 resources');
  });
  
  test('User interaction performance', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Measure interaction performance
    const result = await perfUtils.measureInteraction(async (page) => {
      // Simulate user interaction
      await page.click('a');
      await page.waitForLoadState('networkidle');
    }, {
      name: 'Click navigation',
      screenshot: true,
      trace: true
    });
    
    // Log the results
    console.log(`Interaction duration: ${result.duration}ms`);
    
    // Assert on performance metrics
    expect(result.duration).toBeLessThan(3000, 'Interaction should complete in less than 3 seconds');
  });
  
  test('Run performance test suite', async ({ page }) => {
    // Define test scenarios
    const scenarios = [
      {
        name: 'Homepage load',
        type: 'pageLoad',
        url: 'https://example.com',
        options: {
          screenshot: true,
          trace: true
        }
      },
      {
        name: 'About page load',
        type: 'pageLoad',
        url: 'https://example.com/about',
        options: {
          screenshot: true
        }
      },
      {
        name: 'Navigation interaction',
        type: 'interaction',
        interactionFn: async (page) => {
          await page.goto('https://example.com');
          await page.click('a');
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
      reportPath: './reports/performance/performance-report.html'
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
    // Measure page load with code coverage
    const result = await perfUtils.measurePageLoad('https://example.com', {
      coverage: true,
      screenshot: true
    });
    
    // Log the coverage results
    if (result.coverage) {
      console.log(`JS usage: ${result.coverage.js.usagePercentage.toFixed(2)}%`);
      console.log(`CSS usage: ${result.coverage.css.usagePercentage.toFixed(2)}%`);
      
      // Assert on code coverage
      expect(result.coverage.js.usagePercentage).toBeGreaterThan(50, 'At least 50% of JS should be used');
      expect(result.coverage.css.usagePercentage).toBeGreaterThan(50, 'At least 50% of CSS should be used');
    }
  });
});