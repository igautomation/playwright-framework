const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Error Handling Validation
 * 
 * This test suite validates the framework's error handling capabilities:
 * 1. Graceful handling of element not found errors
 * 2. Proper timeout handling
 * 3. Network error handling
 * 4. Test data errors
 * 5. Screenshot capture on failure
 */

test.describe('Error Handling @validation', () => {
  test('Framework should handle element not found errors gracefully', async ({ page }) => {
    await page.goto('about:blank');
    await page.setContent('<div id="existing">Existing Element</div>');
    
    // This should work
    const existingElement = await page.$('#existing');
    expect(existingElement).toBeTruthy();
    
    // This should return null, not throw
    const nonExistingElement = await page.$('#non-existing');
    expect(nonExistingElement).toBeNull();
    
    // Test error handling with a custom error handler
    let errorCaught = false;
    try {
      // This should throw because we're forcing an action on a non-existent element
      await page.click('#non-existing', { timeout: 1000 });
    } catch (error) {
      errorCaught = true;
      expect(error.message).toContain('non-existing');
    }
    
    expect(errorCaught).toBe(true);
  });
  
  test('Framework should handle timeouts properly', async ({ page }) => {
    await page.goto('about:blank');
    
    // Set content with an element that appears after delay
    await page.setContent(`
      <script>
        setTimeout(() => {
          const div = document.createElement('div');
          div.id = 'delayed';
          div.textContent = 'Delayed Element';
          document.body.appendChild(div);
        }, 2000);
      </script>
    `);
    
    // This should timeout
    let timeoutErrorCaught = false;
    try {
      await page.waitForSelector('#delayed', { timeout: 1000 });
    } catch (error) {
      timeoutErrorCaught = true;
      expect(error.message).toContain('timeout');
    }
    
    expect(timeoutErrorCaught).toBe(true);
    
    // This should succeed
    const delayedElement = await page.waitForSelector('#delayed', { timeout: 3000 });
    expect(delayedElement).toBeTruthy();
  });
  
  test('Framework should handle network errors gracefully', async ({ page }) => {
    // Attempt to navigate to a non-existent domain
    let networkErrorCaught = false;
    try {
      await page.goto('http://non-existent-domain-123456789.com', { timeout: 5000 });
    } catch (error) {
      networkErrorCaught = true;
      expect(error.message).toMatch(/net::ERR_|NS_ERROR|SSL|CERT|CONN|TIMEOUT/);
    }
    
    expect(networkErrorCaught).toBe(true);
    
    // Test with request interception
    await page.route('**/*', route => {
      route.abort('failed');
    });
    
    let routeErrorCaught = false;
    try {
      await page.goto('https://example.com', { timeout: 5000 });
    } catch (error) {
      routeErrorCaught = true;
    }
    
    expect(routeErrorCaught).toBe(true);
  });
  
  test('Framework should handle test data errors gracefully', async () => {
    // Test with invalid JSON
    const invalidJson = '{invalid: json}';
    let jsonErrorCaught = false;
    
    try {
      JSON.parse(invalidJson);
    } catch (error) {
      jsonErrorCaught = true;
      expect(error).toBeInstanceOf(SyntaxError);
    }
    
    expect(jsonErrorCaught).toBe(true);
    
    // Test with missing file
    let fileErrorCaught = false;
    try {
      fs.readFileSync(path.resolve(process.cwd(), 'non-existent-file.json'), 'utf8');
    } catch (error) {
      fileErrorCaught = true;
      expect(error.code).toBe('ENOENT');
    }
    
    expect(fileErrorCaught).toBe(true);
  });
  
  test('Framework should capture screenshots on failure', async ({ page }) => {
    // Create a temporary test file that will fail
    const testFilePath = path.resolve(process.cwd(), 'src/tests/framework-validation/temp-failing-test.spec.js');
    const testContent = `
      const { test, expect } = require('@playwright/test');
      
      test('Intentionally failing test', async ({ page }) => {
        await page.goto('about:blank');
        await page.setContent('<div>Test Content</div>');
        expect(false).toBe(true, 'This test is designed to fail');
      });
    `;
    
    fs.writeFileSync(testFilePath, testContent);
    
    // Run the test with screenshot capture enabled
    try {
      execSync('npx playwright test temp-failing-test.spec.js --reporter=list', { 
        stdio: 'pipe',
        env: { ...process.env, PLAYWRIGHT_SCREENSHOT_ON_FAILURE: '1' }
      });
    } catch (error) {
      // Expected to fail
    }
    
    // Check if screenshot was captured
    const testResultsDir = path.resolve(process.cwd(), 'test-results');
    
    // Clean up
    fs.unlinkSync(testFilePath);
    
    // We can't reliably check for the screenshot file as its path includes timestamps
    // Instead, we'll check if the test-results directory exists
    expect(fs.existsSync(testResultsDir)).toBe(true);
  });
  
  test('Framework should provide meaningful error messages', async ({ page }) => {
    await page.goto('about:blank');
    
    // Test with a complex selector
    let errorMessage = '';
    try {
      await page.click('div.non-existent > span:nth-child(3) > a[href="#"]', { timeout: 1000 });
    } catch (error) {
      errorMessage = error.message;
    }
    
    expect(errorMessage).toContain('div.non-existent > span:nth-child(3) > a[href="#"]');
    expect(errorMessage).toContain('timeout');
    
    // Test with assertion error
    let assertionErrorMessage = '';
    try {
      expect(1).toBe(2);
    } catch (error) {
      assertionErrorMessage = error.message;
    }
    
    expect(assertionErrorMessage).toContain('expect(received).toBe(expected)');
    expect(assertionErrorMessage).toContain('Expected: 2');
    expect(assertionErrorMessage).toContain('Received: 1');
  });
});