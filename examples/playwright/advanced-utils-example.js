/**
 * Example demonstrating how to use PlaywrightUtils for advanced browser automation
 */
const path = require('path');
const fs = require('fs');
const { PlaywrightUtils } = require('../../src/utils/common');

// Create output directory for examples
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function runAdvancedUtilsExamples() {
  console.log('Running Playwright advanced utilities examples...');
  
  try {
    // Example 1: Launch different browser types
    console.log('Example 1: Launching different browser types...');
    
    // Launch Chromium
    console.log('Launching Chromium...');
    const chromiumBrowser = await PlaywrightUtils.launchBrowser('chromium', { headless: true });
    console.log('Chromium launched successfully');
    await chromiumBrowser.close();
    
    // Launch Firefox
    console.log('Launching Firefox...');
    const firefoxBrowser = await PlaywrightUtils.launchBrowser('firefox', { headless: true });
    console.log('Firefox launched successfully');
    await firefoxBrowser.close();
    
    // Launch WebKit
    console.log('Launching WebKit...');
    const webkitBrowser = await PlaywrightUtils.launchBrowser('webkit', { headless: true });
    console.log('WebKit launched successfully');
    await webkitBrowser.close();
    
    // Example 2: Record video of browser session
    console.log('\nExample 2: Recording video of browser session...');
    const videoPath = await PlaywrightUtils.recordVideo(
      async (page) => {
        // Navigate to Playwright website
        await page.goto('https://playwright.dev/');
        
        // Perform some interactions
        await page.click('a:has-text("Get Started")');
        await page.waitForLoadState('networkidle');
        
        // Scroll down
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(1000);
        
        // Click on another link
        const docsLink = await page.$('a:has-text("API")');
        if (docsLink) {
          await docsLink.click();
          await page.waitForLoadState('networkidle');
        }
        
        // Wait a bit to capture more video
        await page.waitForTimeout(2000);
      },
      {
        videoDir: outputDir,
        videoPath: path.join(outputDir, 'browser-session.webm')
      }
    );
    
    console.log(`Video recorded to: ${videoPath}`);
    
    // Example 3: Take screenshots with device emulation
    console.log('\nExample 3: Taking screenshots with device emulation...');
    
    // Get available devices
    const devices = PlaywrightUtils.getAvailableDevices();
    console.log(`Found ${devices.length} available devices for emulation`);
    
    // Take screenshots with a few selected devices
    const selectedDevices = ['iPhone 13', 'Pixel 5', 'Desktop Chrome'];
    
    for (const device of selectedDevices) {
      if (devices.includes(device)) {
        console.log(`Taking screenshot with ${device} emulation...`);
        const screenshotPath = path.join(outputDir, `${device.replace(/\s+/g, '-').toLowerCase()}-screenshot.png`);
        
        await PlaywrightUtils.screenshotWithDevice(
          'https://playwright.dev/',
          device,
          { path: screenshotPath }
        );
        
        console.log(`Screenshot saved to: ${screenshotPath}`);
      } else {
        console.log(`Device not available: ${device}`);
      }
    }
    
    // Example 4: Compare screenshots
    console.log('\nExample 4: Comparing screenshots...');
    
    // Create a simple HTML file with two versions
    const htmlPath1 = path.join(outputDir, 'version1.html');
    fs.writeFileSync(htmlPath1, `
      <html>
        <head>
          <style>
            body { font-family: Arial; margin: 20px; }
            .box { width: 200px; height: 100px; background-color: blue; margin: 20px; }
          </style>
        </head>
        <body>
          <h1>Version 1</h1>
          <div class="box"></div>
          <p>This is version 1 of the test page.</p>
        </body>
      </html>
    `);
    
    const htmlPath2 = path.join(outputDir, 'version2.html');
    fs.writeFileSync(htmlPath2, `
      <html>
        <head>
          <style>
            body { font-family: Arial; margin: 20px; }
            .box { width: 200px; height: 100px; background-color: red; margin: 20px; }
          </style>
        </head>
        <body>
          <h1>Version 2</h1>
          <div class="box"></div>
          <p>This is version 2 of the test page with changes.</p>
        </body>
      </html>
    `);
    
    // Take screenshots of both versions
    const browser = await PlaywrightUtils.launchBrowser('chromium');
    const page = await browser.newPage();
    
    await page.goto(`file://${htmlPath1}`);
    const screenshot1Path = path.join(outputDir, 'version1-screenshot.png');
    await page.screenshot({ path: screenshot1Path });
    
    await page.goto(`file://${htmlPath2}`);
    const screenshot2Path = path.join(outputDir, 'version2-screenshot.png');
    await page.screenshot({ path: screenshot2Path });
    
    await browser.close();
    
    // Compare screenshots
    const comparisonResult = await PlaywrightUtils.compareScreenshots(
      screenshot1Path,
      screenshot2Path,
      {
        threshold: 10,
        diffPath: path.join(outputDir, 'screenshot-diff.png')
      }
    );
    
    console.log('Screenshot comparison results:');
    console.log(`- Diff pixels: ${comparisonResult.diffPixels}`);
    console.log(`- Diff percentage: ${comparisonResult.diffPercentage.toFixed(2)}%`);
    console.log(`- Diff image saved to: ${comparisonResult.diffImagePath}`);
    
    // Example 5: Extract data from a webpage
    console.log('\nExample 5: Extracting data from a webpage...');
    
    const extractedData = await PlaywrightUtils.extractData(
      'https://playwright.dev/',
      {
        title: 'title',
        heading: 'h1',
        subheading: '.hero__subtitle',
        links: {
          selector: 'nav a',
          multiple: true
        },
        logoSrc: {
          selector: '.navbar__logo img',
          attribute: 'src'
        },
        navItems: {
          selector: '.navbar__items a',
          multiple: true,
          transform: text => text.trim()
        }
      }
    );
    
    console.log('Extracted data:');
    console.log(JSON.stringify(extractedData, null, 2));
    
    // Save extracted data to file
    fs.writeFileSync(
      path.join(outputDir, 'extracted-data.json'),
      JSON.stringify(extractedData, null, 2)
    );
    
    console.log('\nAll advanced utilities examples completed successfully!');
  } catch (error) {
    console.error('Error running advanced utilities examples:', error);
  }
}

// Run the examples
runAdvancedUtilsExamples().catch(console.error);