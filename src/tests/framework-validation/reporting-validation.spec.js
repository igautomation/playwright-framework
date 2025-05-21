const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Reporting Validation
 * 
 * This test suite validates the framework's reporting capabilities:
 * 1. HTML report generation
 * 2. JSON report generation
 * 3. Screenshot capture in reports
 * 4. Video recording
 * 5. Custom report formats
 */

test.describe('Reporting Validation @validation', () => {
  test('Framework should generate HTML reports', async () => {
    // Create a simple test file
    const testFilePath = path.resolve(process.cwd(), 'src/tests/framework-validation/temp-report-test.spec.js');
});

    const testContent = `
      const { test, expect } = require('@playwright/test');
      
      test('Simple test for HTML report', async ({ page }) => {
        await page.goto('about:blank');
        await page.setContent('<div>Test Content</div>');
        expect(true).toBe(true);
      });
    `;
    
    fs.writeFileSync(testFilePath, testContent);
    
    // Run the test with HTML reporter
    const reportDir = path.resolve(process.cwd(), 'temp-html-report');
    
    execSync(`npx playwright test temp-report-test.spec.js --reporter=html --reporter-options=outputFolder=${reportDir}`, { 
      stdio: 'pipe' 
    });
    
    // Check if HTML report was generated
    expect(fs.existsSync(reportDir)).toBe(true);
    expect(fs.existsSync(path.join(reportDir, 'index.html'))).toBe(true);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    fs.rmSync(reportDir, { recursive: true, force: true });
  });
  
  test('Framework should generate JSON reports', async () => {
    // Create a simple test file
    const testFilePath = path.resolve(process.cwd(), 'src/tests/framework-validation/temp-json-report-test.spec.js');
    const testContent = `
      const { test, expect } = require('@playwright/test');
      
      test('Simple test for JSON report', async ({ page }) => {
        await page.goto('about:blank');
        await page.setContent('<div>Test Content</div>');
        expect(true).toBe(true);
      });
    `;
    
    fs.writeFileSync(testFilePath, testContent);
    
    // Run the test with JSON reporter
    const jsonReportPath = path.resolve(process.cwd(), 'temp-report.json');
    
    execSync(`npx playwright test temp-json-report-test.spec.js --reporter=json --reporter-options=outputFile=${jsonReportPath}`, { 
      stdio: 'pipe' 
    });
    
    // Check if JSON report was generated
    expect(fs.existsSync(jsonReportPath)).toBe(true);
    
    // Validate JSON structure
    const reportContent = fs.readFileSync(jsonReportPath, 'utf8');
    const report = JSON.parse(reportContent);
    
    expect(report).toBeDefined();
    expect(report.suites).toBeDefined();
    expect(Array.isArray(report.suites)).toBe(true);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    fs.unlinkSync(jsonReportPath);
  });
  
  test('Framework should capture screenshots in reports', async () => {
    // Create a test file that takes a screenshot
    const testFilePath = path.resolve(process.cwd(), 'src/tests/framework-validation/temp-screenshot-test.spec.js');
    const testContent = `
      const { test, expect } = require('@playwright/test');
      const path = require('path');
      
      test('Screenshot test', async ({ page }) => {
        await page.goto('about:blank');
        await page.setContent('<div style="width: 100px; height: 100px; background: red;">Red Box</div>');
        
        const screenshotPath = path.resolve(process.cwd(), 'temp-screenshot.png');
        await page.screenshot({ path: screenshotPath });
        
        expect(true).toBe(true);
      });
    `;
    
    fs.writeFileSync(testFilePath, testContent);
    
    // Run the test
    execSync(`npx playwright test temp-screenshot-test.spec.js --reporter=list`, { 
      stdio: 'pipe' 
    });
    
    // Check if screenshot was generated
    const screenshotPath = path.resolve(process.cwd(), 'temp-screenshot.png');
    expect(fs.existsSync(screenshotPath)).toBe(true);
    
    // Verify it's a valid image
    const stats = fs.statSync(screenshotPath);
    expect(stats.size).toBeGreaterThan(0);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    fs.unlinkSync(screenshotPath);
  });
  
  test('Framework should support video recording', async () => {
    // Create a test file for video recording
    const testFilePath = path.resolve(process.cwd(), 'src/tests/framework-validation/temp-video-test.spec.js');
    const testContent = `
      const { test, expect } = require('@playwright/test');
      
      test('Video recording test', async ({ page }) => {
        await page.goto('about:blank');
        await page.setContent('<div>Video Test</div>');
        
        // Perform some actions for the video
        for (let i = 0; i < 5; i++) {
          await page.setContent(\`<div>Count: \${i}</div>\`);
          // Replaced timeout with proper waiting
await page.waitForLoadState("networkidle");
        }
        
        expect(true).toBe(true);
      });
    `;
    
    fs.writeFileSync(testFilePath, testContent);
    
    // Create a custom config for video recording
    const configPath = path.resolve(process.cwd(), 'temp-video-config.js');
    const configContent = `
      const { defineConfig } = require('@playwright/test');
      
      module.exports = defineConfig({
        use: {
          video: 'on',
        },
        outputDir: 'temp-test-results',
      });
    `;
    
    fs.writeFileSync(configPath, configContent);
    
    // Run the test with video recording
    execSync(`npx playwright test temp-video-test.spec.js --config=temp-video-config.js`, { 
      stdio: 'pipe' 
    });
    
    // Check if video directory exists
    const videoDir = path.resolve(process.cwd(), 'temp-test-results');
    expect(fs.existsSync(videoDir)).toBe(true);
    
    // Find video files
    const files = fs.readdirSync(videoDir);
    const videoFiles = files.filter(file => file.endsWith('.webm'));
    
    expect(videoFiles.length).toBeGreaterThan(0);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    fs.unlinkSync(configPath);
    fs.rmSync(videoDir, { recursive: true, force: true });
  });
  
  test('Framework should support custom report generation', async () => {
    // Create a simple test file
    const testFilePath = path.resolve(process.cwd(), 'src/tests/framework-validation/temp-custom-report-test.spec.js');
    const testContent = `
      const { test, expect } = require('@playwright/test');
      
      test('Test for custom report', async ({ page }) => {
        await page.goto('about:blank');
        await page.setContent('<div>Custom Report Test</div>');
        expect(true).toBe(true);
      });
    `;
    
    fs.writeFileSync(testFilePath, testContent);
    
    // Create a custom reporter
    const reporterPath = path.resolve(process.cwd(), 'temp-custom-reporter.js');
    const reporterContent = `
      class CustomReporter {
        onBegin(config, suite) {
          console.log('Starting the run with config:', config.rootDir);
        }
        
        onTestBegin(test) {
          console.log(\`Starting test: \${test.title}\`);
        }
        
        onTestEnd(test, result) {
          console.log(\`Finished test: \${test.title} with status: \${result.status}\`);
        }
        
        onEnd(result) {
          console.log(\`Finished the run: \${result.status}\`);
          
          // Write a custom report file
          const fs = require('fs');
          const path = require('path');
          
          const reportPath = path.resolve(process.cwd(), 'custom-report.json');
          fs.writeFileSync(reportPath, JSON.stringify({
            status: result.status,
            timestamp: new Date().toISOString(),
            tests: result.status
          }));
        }
      }
      
      module.exports = CustomReporter;
    `;
    
    fs.writeFileSync(reporterPath, reporterContent);
    
    // Run the test with custom reporter
    execSync(`npx playwright test temp-custom-report-test.spec.js --reporter=${reporterPath}`, { 
      stdio: 'pipe' 
    });
    
    // Check if custom report was generated
    const customReportPath = path.resolve(process.cwd(), 'custom-report.json');
    expect(fs.existsSync(customReportPath)).toBe(true);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    fs.unlinkSync(reporterPath);
    fs.unlinkSync(customReportPath);
  });
});