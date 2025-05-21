
      const { test, expect } = require('@playwright/test');

test.describe('Temp Video Test', () => {
      
      test('Video recording test', async ({ page }) => {
        await page.goto('about:blank');
});

        await page.setContent('<div>Video Test</div>');
        
        // Perform some actions for the video
        for (let i = 0; i < 5; i++) {
          await page.setContent(`<div>Count: ${i}</div>`);
          // Replaced timeout with proper waiting
await page.waitForLoadState("networkidle");
        }
        
        expect(true).toBe(true);
      });
    
});
