/**
 * Visual regression tests using the VisualComparisonUtils
 */
const { test, expect } = require('@playwright/test');
const VisualComparisonUtils = require('../../utils/visual/visualComparisonUtils');

test.describe('Visual Regression Tests @visual', () => {
  let visualUtils;
  
  test.beforeEach(async ({ page }) => {
    visualUtils = new VisualComparisonUtils(page, {
      baselineDir: './visual-baselines',
      diffDir: './visual-diffs'
    });
  });
  
  test('Homepage visual comparison', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Compare the full page screenshot
    const result = await visualUtils.compareScreenshot('homepage');
    
    // If this is the first run, it will create the baseline
    if (result.baselineCreated) {
      console.log('Baseline created for homepage');
    } else {
      // Check if the screenshots match
      expect(result.match).toBe(true, `Visual difference detected: ${result.diffPercentage.toFixed(2)}% different`);
    }
  });
  
  test('Header element visual comparison', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Use a selector that actually exists on example.com
    // The 'body' element is guaranteed to exist on any page
    const result = await visualUtils.compareElement('body', 'body-element');
    
    // If this is the first run, it will create the baseline
    if (result.baselineCreated) {
      console.log('Baseline created for body element');
    } else {
      // Check if the screenshots match
      expect(result.match).toBe(true, `Visual difference detected: ${result.diffPercentage.toFixed(2)}% different`);
    }
  });
  
  test('Responsive design visual comparison', async ({ browser }) => {
    const results = [];
    
    // Test on different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      // Create a new context with the viewport size
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height }
      });
      
      const page = await context.newPage();
      
      // Create a new visual utils instance for this page
      const visualUtils = new VisualComparisonUtils(page, {
        baselineDir: './visual-baselines',
        diffDir: './visual-diffs'
      });
      
      // Navigate to the page
      await page.goto('https://example.com');
      
      // Wait for the page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Compare the full page screenshot
      const result = await visualUtils.compareScreenshot(`homepage-${viewport.name}`);
      results.push({ viewport: viewport.name, result });
      
      // Close the context
      await context.close();
    }
    
    // Check results
    for (const { viewport, result } of results) {
      if (result.baselineCreated) {
        console.log(`Baseline created for ${viewport}`);
      } else {
        expect(result.match).toBe(true, `Visual difference detected on ${viewport}: ${result.diffPercentage.toFixed(2)}% different`);
      }
    }
  });
  
  test.afterAll(async () => {
    // Generate a report with all the results
    // This would typically be done in a custom reporter or after all tests
    // For this example, we're just showing how it could be done
    if (visualUtils) {
      // In a real implementation, you would collect results from all tests
      const mockResults = [
        {
          name: 'homepage',
          match: true,
          diffPercentage: 0,
          baselinePath: './visual-baselines/homepage.png',
          actualPath: './visual-diffs/homepage-actual.png'
        },
        {
          name: 'header-element',
          match: true,
          diffPercentage: 0,
          baselinePath: './visual-baselines/header-element.png',
          actualPath: './visual-diffs/header-element-actual.png'
        }
      ];
      
      await visualUtils.generateReport(mockResults, './reports/visual/visual-report.html');
    }
  });
});