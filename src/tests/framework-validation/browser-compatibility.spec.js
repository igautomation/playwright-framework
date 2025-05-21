const { test, expect } = require('@playwright/test');

/**
 * Browser Compatibility Validation
 * 
 * This test suite validates that the framework works correctly across different browsers:
 * 1. Chromium
 * 2. Firefox
 * 3. WebKit
 * 4. Mobile viewports
 */

test.describe('Browser Compatibility @validation', () => {
  test('Framework should work in Chromium', async ({ browser }) => {
    // Skip if not running in Chromium
    test.skip(browser.browserType().name() !== 'chromium', 'Test requires Chromium');
});

    const page = await browser.newPage();
    await page.goto('about:blank');
    
    // Test basic page interactions
    await page.setContent('<button id="testButton">Click Me</button>');
    await page.click('#testButton');
    
    // Test screenshot functionality
    const screenshot = await page.screenshot();
    expect(screenshot).toBeTruthy();
    expect(screenshot.length).toBeGreaterThan(0);
    
    await page.close();
  });
  
  test('Framework should work in Firefox', async ({ browser }) => {
    // Skip if not running in Firefox
    test.skip(browser.browserType().name() !== 'firefox', 'Test requires Firefox');
    
    const page = await browser.newPage();
    await page.goto('about:blank');
    
    // Test basic page interactions
    await page.setContent('<button id="testButton">Click Me</button>');
    await page.click('#testButton');
    
    // Test screenshot functionality
    const screenshot = await page.screenshot();
    expect(screenshot).toBeTruthy();
    expect(screenshot.length).toBeGreaterThan(0);
    
    await page.close();
  });
  
  test('Framework should work in WebKit', async ({ browser }) => {
    // Skip if not running in WebKit
    test.skip(browser.browserType().name() !== 'webkit', 'Test requires WebKit');
    
    const page = await browser.newPage();
    await page.goto('about:blank');
    
    // Test basic page interactions
    await page.setContent('<button id="testButton">Click Me</button>');
    await page.click('#testButton');
    
    // Test screenshot functionality
    const screenshot = await page.screenshot();
    expect(screenshot).toBeTruthy();
    expect(screenshot.length).toBeGreaterThan(0);
    
    await page.close();
  });
  
  test('Framework should work with mobile viewport', async ({ browser }) => {
    const mobileViewport = { width: 375, height: 667 };
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1';
    
    const context = await browser.newContext({
      viewport: mobileViewport,
      userAgent
    });
    
    const page = await context.newPage();
    await page.goto('about:blank');
    
    // Test viewport size
    const viewport = page.viewportSize();
    expect(viewport.width).toBe(mobileViewport.width);
    expect(viewport.height).toBe(mobileViewport.height);
    
    // Test user agent
    const detectedUserAgent = await page.evaluate(() => navigator.userAgent);
    expect(detectedUserAgent).toBe(userAgent);
    
    // Test touch support
    const hasTouch = await page.evaluate(() => 'ontouchstart' in window);
    expect(hasTouch).toBe(true);
    
    await context.close();
  });
  
  test('Framework should handle responsive design', async ({ page }) => {
    await page.goto('about:blank');
    
    // Create a responsive page
    await page.setContent(`
      <style>
        body { margin: 0; padding: 0; }
        .box {
          width: 100%;
          height: 100px;
          background-color: blue;
        }
        @media (max-width: 600px) {
          .box {
            background-color: red;
          }
        }
      </style>
      <div class="box"></div>
    `);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    let boxColor = await page.evaluate(() => {
      return window.getComputedStyle(document.querySelector('.box')).backgroundColor;
    });
    expect(['rgb(0, 0, 255)', 'blue']).toContain(boxColor);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    boxColor = await page.evaluate(() => {
      return window.getComputedStyle(document.querySelector('.box')).backgroundColor;
    });
    expect(['rgb(255, 0, 0)', 'red']).toContain(boxColor);
  });
  
  test('Framework should handle browser features detection', async ({ page, browserName }) => {
    await page.goto('about:blank');
    
    // Test feature detection
    const features = await page.evaluate(() => {
      return {
        localStorage: 'localStorage' in window,
        sessionStorage: 'sessionStorage' in window,
        indexedDB: 'indexedDB' in window,
        webWorkers: 'Worker' in window,
        fetch: 'fetch' in window,
        serviceWorker: 'serviceWorker' in navigator
      };
    });
    
    // All modern browsers should support these features
    expect(features.localStorage).toBe(true);
    expect(features.sessionStorage).toBe(true);
    expect(features.indexedDB).toBe(true);
    expect(features.webWorkers).toBe(true);
    expect(features.fetch).toBe(true);
    
    // Log browser-specific features
    console.log(`Browser: ${browserName}`);
    console.log('Supported features:', features);
  });
});