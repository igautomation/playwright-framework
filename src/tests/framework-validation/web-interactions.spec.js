const { test, expect } = require('@playwright/test');
const WebInteractions = require('../../utils/web/webInteractions');

test.describe('Web Interactions @validation', () => {
  test('should navigate to a URL', async ({ page }) => {
    const webInteractions = new WebInteractions(page);
});

    await page.goto(process.env.EXAMPLE_URL);
    const title = await page.title();
    expect(title).toBeDefined();
  });

  test('should get text from element', async ({ page }) => {
    await page.setContent('<div id="test">Test Text</div>');
    const webInteractions = new WebInteractions(page);
    const text = await webInteractions.getText('#test');
    expect(text).toBe('Test Text');
  });

  test('should fill input field', async ({ page }) => {
    await page.setContent('<input id="test" type="text">');
    const webInteractions = new WebInteractions(page);
    await page.locator('#test').fill('Test Value');
    const value = await page.locator('#test').inputValue();
    expect(value).toBe('Test Value');
  });
});
