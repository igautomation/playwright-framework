
      const { test, expect } = require('@playwright/test');
      
      test('Simple test for HTML report', async ({ page }) => {
        await page.goto('about:blank');
        await page.setContent('<div>Test Content</div>');
        expect(true).toBe(true);
      });
    