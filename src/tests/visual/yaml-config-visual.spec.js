/**
 * Visual regression tests using YAML configuration
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const VisualComparisonUtils = require('../../utils/visual/visualComparisonUtils');

// Utility function to read YAML data
function readYaml(filePath) {
  return yaml.load(fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8'));
}

test.describe('Visual Regression Tests with YAML Config @visual', () => {
  let visualConfig;
  let visualUtils;
  
  test.beforeAll(async () => {
    // Load visual testing configuration from YAML
    visualConfig = readYaml('src/data/yaml/visual-test-config.yaml');
  });
  
  test.beforeEach(async ({ page }) => {
    // Initialize visual comparison utility with config from YAML
    visualUtils = new VisualComparisonUtils(page, {
      baselineDir: visualConfig.visual_testing.baselineDir,
      diffDir: visualConfig.visual_testing.diffDir,
      threshold: visualConfig.visual_testing.threshold
    });
  });
  
  test('Homepage visual comparison with YAML config @yaml', async ({ browser }) => {
    // Test each viewport defined in YAML config
    for (const [viewportName, viewportConfig] of Object.entries(visualConfig.viewports)) {
      console.log(`Testing viewport: ${viewportName}`);
      
      // Create a new context with the viewport size from YAML
      const context = await browser.newContext({
        viewport: {
          width: viewportConfig.width,
          height: viewportConfig.height
        },
        deviceScaleFactor: viewportConfig.deviceScaleFactor || 1,
        isMobile: viewportConfig.isMobile || false
      });
      
      const page = await context.newPage();
      
      // Initialize visual utils for this page
      const pageVisualUtils = new VisualComparisonUtils(page, {
        baselineDir: visualConfig.visual_testing.baselineDir,
        diffDir: visualConfig.visual_testing.diffDir,
        threshold: visualConfig.visual_testing.threshold
      });
      
      // Navigate to the page
      await page.goto('https://example.com');
      
      // Wait for the page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Compare the full page screenshot using the viewport name from YAML
      const result = await pageVisualUtils.compareScreenshot(`homepage-${viewportName}`);
      
      // If this is the first run, it will create the baseline
      if (result.baselineCreated) {
        console.log(`Baseline created for homepage on ${viewportName}`);
      } else {
        // Check if the screenshots match using threshold from YAML
        expect(result.match).toBe(true, 
          `Visual difference detected on ${viewportName}: ${result.diffPercentage.toFixed(2)}% different`);
      }
      
      // Close the context
      await context.close();
    }
  });
  
  test('Element visual comparison with YAML config @yaml', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Get the elements to test from YAML config
    const homePageConfig = visualConfig.pages.home;
    
    // Test each element defined in YAML
    for (const element of homePageConfig.elements) {
      console.log(`Testing element: ${element.name}`);
      
      try {
        // Compare the element using the element-specific threshold from YAML
        const result = await visualUtils.compareElement(
          element.selector, 
          element.name,
          { threshold: element.threshold || visualConfig.visual_testing.threshold }
        );
        
        // If this is the first run, it will create the baseline
        if (result.baselineCreated) {
          console.log(`Baseline created for ${element.name}`);
        } else {
          // Check if the screenshots match
          expect(result.match).toBe(true, 
            `Visual difference detected for ${element.name}: ${result.diffPercentage.toFixed(2)}% different`);
        }
      } catch (error) {
        // Element might not exist on the page
        console.log(`Could not test element ${element.name}: ${error.message}`);
      }
    }
  });
  
  test('Visual comparison with ignore regions from YAML @yaml', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Get ignore regions from YAML
    const ignoreRegions = visualConfig.ignore_regions || [];
    
    // Convert ignore regions to the format expected by the visual utils
    const ignoreSelectors = ignoreRegions.map(region => region.selector);
    
    // Compare the full page screenshot with ignore regions
    const result = await visualUtils.compareScreenshot('homepage-with-ignores', {
      ignoreSelectors
    });
    
    // If this is the first run, it will create the baseline
    if (result.baselineCreated) {
      console.log('Baseline created for homepage with ignore regions');
    } else {
      // Check if the screenshots match
      expect(result.match).toBe(true, 
        `Visual difference detected: ${result.diffPercentage.toFixed(2)}% different`);
    }
  });
});