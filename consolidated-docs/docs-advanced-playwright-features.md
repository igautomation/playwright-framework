<!-- Source: /Users/mzahirudeen/playwright-framework/docs/advanced-playwright-features.md -->

# Advanced Playwright Features

This guide covers advanced Playwright features implemented in the framework based on the latest Playwright documentation.

## Overview

Playwright offers many advanced features beyond basic browser automation. The `PlaywrightUtils` class in our framework provides access to these features:

- Multiple browser engines (Chromium, Firefox, WebKit)
- Device emulation
- Video recording
- Visual comparison
- Data extraction
- Persistent contexts

## Multiple Browser Engines

Playwright supports three browser engines:

```javascript
const { PlaywrightUtils } = require('../utils/common');

// Launch Chromium (default)
const chromiumBrowser = await PlaywrightUtils.launchBrowser('chromium');

// Launch Firefox
const firefoxBrowser = await PlaywrightUtils.launchBrowser('firefox');

// Launch WebKit (Safari)
const webkitBrowser = await PlaywrightUtils.launchBrowser('webkit');
```

This allows you to test your applications across different browser engines to ensure compatibility.

## Device Emulation

Playwright provides built-in device emulation for testing responsive designs:

```javascript
const { PlaywrightUtils } = require('../utils/common');

// Get available devices
const devices = PlaywrightUtils.getAvailableDevices();
console.log(devices); // ['iPhone 13', 'Pixel 5', 'Desktop Chrome', ...]

// Take screenshot with device emulation
await PlaywrightUtils.screenshotWithDevice(
  'https://example.com',
  'iPhone 13',
  { path: 'iphone-screenshot.png' }
);
```

This is useful for testing how your application looks and behaves on different devices.

## Video Recording

Record videos of browser sessions for debugging or documentation:

```javascript
const { PlaywrightUtils } = require('../utils/common');

const videoPath = await PlaywrightUtils.recordVideo(
  async (page) => {
    // Navigate to website
    await page.goto('https://example.com');
    
    // Perform interactions
    await page.click('#login-button');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password');
    await page.click('#submit');
    
    // Wait for navigation
    await page.waitForNavigation();
  },
  {
    videoDir: './videos',
    videoPath: './videos/login-flow.webm'
  }
);

console.log(`Video saved to: ${videoPath}`);
```

This feature is particularly useful for:
- Documenting user flows
- Debugging intermittent issues
- Creating visual documentation

## Visual Comparison

Compare screenshots to detect visual regressions:

```javascript
const { PlaywrightUtils } = require('../utils/common');

const result = await PlaywrightUtils.compareScreenshots(
  'baseline.png',
  'current.png',
  {
    threshold: 10, // Pixel difference threshold
    diffPath: 'diff.png' // Path to save difference image
  }
);

console.log(`Difference: ${result.diffPercentage.toFixed(2)}%`);
if (result.diffPercentage > 5) {
  console.log('Visual regression detected!');
}
```

This allows you to:
- Detect unintended visual changes
- Implement visual regression testing
- Ensure consistent appearance across releases

## Data Extraction

Extract structured data from web pages:

```javascript
const { PlaywrightUtils } = require('../utils/common');

const data = await PlaywrightUtils.extractData(
  'https://example.com/products',
  {
    title: 'h1',
    price: '.product-price',
    description: '.product-description',
    images: {
      selector: '.product-image',
      attribute: 'src',
      multiple: true
    },
    features: {
      selector: '.feature-item',
      multiple: true,
      transform: text => text.trim()
    }
  }
);

console.log(data);
// {
//   title: 'Product Name',
//   price: '$99.99',
//   description: 'Product description...',
//   images: ['image1.jpg', 'image2.jpg'],
//   features: ['Feature 1', 'Feature 2', 'Feature 3']
// }
```

This is useful for:
- Web scraping
- Content monitoring
- Data collection
- Testing data presentation

## Persistent Contexts

Create persistent browser contexts that maintain state between sessions:

```javascript
const { PlaywrightUtils } = require('../utils/common');

// Create a persistent context
const userDataDir = './user-data';
const context = await PlaywrightUtils.createPersistentContext(userDataDir, {
  viewport: { width: 1280, height: 720 }
});

// Use the context
const page = await context.newPage();
await page.goto('https://example.com');

// Login (state will be saved)
await page.fill('#username', 'testuser');
await page.fill('#password', 'password');
await page.click('#login-button');

// Close the context
await context.close();

// Later, reuse the same context with saved state
const sameContext = await PlaywrightUtils.createPersistentContext(userDataDir);
const newPage = await sameContext.newPage();
await newPage.goto('https://example.com/account');
// User is still logged in
```

This is useful for:
- Testing authenticated flows
- Preserving cookies and local storage
- Simulating returning users

## Advanced Error Handling

The framework includes advanced error handling for Playwright operations:

```javascript
const { PlaywrightUtils, PlaywrightErrorHandler } = require('../utils/common');

// Retry mechanism for flaky operations
const retryableOperation = PlaywrightErrorHandler.withRetry(
  async () => {
    const browser = await PlaywrightUtils.launchBrowser();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await page.click('#flaky-button');
    await browser.close();
  },
  {
    maxRetries: 3,
    retryDelay: 1000
  }
);

await retryableOperation();
```

## Integration with Reporting

These advanced features integrate with the reporting system:

```javascript
const { PlaywrightUtils } = require('../utils/common');
const { ChartGenerator } = require('../utils/visualization');

async function generateResponsiveReport(url) {
  const chartGenerator = new ChartGenerator();
  const devices = ['Desktop Chrome', 'iPhone 13', 'iPad Pro'];
  const screenshots = [];
  
  // Take screenshots with different devices
  for (const device of devices) {
    const screenshotPath = await PlaywrightUtils.screenshotWithDevice(
      url,
      device,
      { path: `./screenshots/${device.replace(/\s+/g, '-').toLowerCase()}.png` }
    );
    
    screenshots.push({
      device,
      path: screenshotPath
    });
  }
  
  // Generate report with screenshots
  const reportPath = await chartGenerator.generateReport(
    screenshots.map(screenshot => ({
      type: 'image',
      title: `${screenshot.device} Screenshot`,
      path: screenshot.path
    })),
    'Responsive Design Report'
  );
  
  return reportPath;
}
```

## Best Practices

### Browser Selection

- Use **Chromium** for most testing (fastest and most stable)
- Use **Firefox** and **WebKit** for compatibility testing
- Consider your target audience when prioritizing browser engines

### Device Emulation

- Test on common device sizes (mobile, tablet, desktop)
- Include both iOS and Android devices in your testing
- Test both portrait and landscape orientations for mobile devices

### Video Recording

- Keep recordings focused on specific user flows
- Use lower resolution for faster processing
- Clean up old recordings to save disk space

### Visual Comparison

- Establish a baseline in a controlled environment
- Use appropriate thresholds for your application
- Ignore dynamic areas (dates, random content)
- Run comparisons on the same browser engine

### Data Extraction

- Be specific with selectors
- Handle missing elements gracefully
- Use transforms to clean up extracted data
- Respect website terms of service when scraping

### Error Handling

- Use retry mechanisms for network operations
- Set appropriate timeouts for different operations
- Implement graceful degradation for non-critical features

## Examples

See the [advanced-utils-example.js](../examples/playwright/advanced-utils-example.js) file for practical examples of using these features.

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Device Emulation](https://playwright.dev/docs/emulation)
- [Video Recording](https://playwright.dev/docs/videos)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Error Handling Guide](./error-handling-guide.md)