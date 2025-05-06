const { test, expect } = require('@playwright/test');
const SelfHealingLocator = require('../../utils/web/SelfHealingLocator');
const DOMComparisonUtils = require('../../utils/web/domComparisonUtils');
const fs = require('fs');
const path = require('path');

test.describe('Auto-Healing and DOM Comparison Demo @demo @auto-heal', () => {
  test('Self-healing locators should recover from broken selectors', async ({
    page,
  }) => {
    // Set up test page with elements
    await page.setContent(`
      <div>
        <button data-testid="login-button" id="login-btn">Login</button>
        <input data-testid="username-input" id="username" placeholder="Username" />
        <input data-testid="password-input" id="password" type="password" placeholder="Password" />
      </div>
    `);

    // Create self-healing locator
    const selfHealingLocator = new SelfHealingLocator(page);

    // First, use the correct selector
    const loginButton = await selfHealingLocator.getLocator('#login-btn');
    await expect(loginButton).toHaveText('Login');

    // Now, change the DOM to simulate a broken selector
    await page.evaluate(() => {
      const button = document.querySelector('#login-btn');
      button.id = 'signin-btn'; // Change the ID to break the selector
    });

    // Try to use the original selector, which should now be broken
    // The self-healing locator should fall back to data-testid
    const healedButton = await selfHealingLocator.getLocator('#login-btn', [
      '[data-testid="login-button"]',
    ]);

    // Verify the button was found using the fallback selector
    await expect(healedButton).toHaveText('Login');

    // Check if the healed locator was stored
    const healedLocatorsPath = path.resolve(
      process.cwd(),
      'data/healed-locators.json'
    );
    expect(fs.existsSync(healedLocatorsPath)).toBeTruthy();

    const healedLocators = JSON.parse(
      fs.readFileSync(healedLocatorsPath, 'utf8')
    );
    expect(healedLocators).toHaveProperty('#login-btn');
    expect(healedLocators['#login-btn']).toBe('[data-testid="login-button"]');
  });

  test('DOM comparison should detect and update changed locators', async ({
    page,
  }) => {
    // Create DOM comparison utils
    const domComparisonUtils = new DOMComparisonUtils(page);

    // Set up initial page content
    await page.setContent(`
      <div>
        <h1 id="title">Welcome</h1>
        <button id="login-btn">Login</button>
        <input id="username" placeholder="Username" />
        <input id="password" type="password" placeholder="Password" />
      </div>
    `);

    // Capture initial DOM and extract locators
    const pageName = 'login-page';
    await domComparisonUtils.captureDom(pageName);
    const initialLocators = await domComparisonUtils.extractLocators();

    // Save initial locators
    domComparisonUtils.saveLocators(pageName, initialLocators);

    // Verify initial locators
    expect(initialLocators).toHaveProperty('h1-title');
    expect(initialLocators).toHaveProperty('button-login-btn');
    expect(initialLocators).toHaveProperty('input-username');
    expect(initialLocators).toHaveProperty('input-password');

    // Change the DOM to simulate UI changes
    await page.setContent(`
      <div>
        <h1 id="page-title">Welcome</h1> <!-- ID changed -->
        <button id="signin-btn">Sign In</button> <!-- ID and text changed -->
        <input id="user-email" placeholder="Email" /> <!-- ID and placeholder changed -->
        <input id="user-password" type="password" placeholder="Password" /> <!-- ID changed -->
      </div>
    `);

    // Compare DOM and update locators
    const updatedLocators =
      await domComparisonUtils.compareAndUpdateLocators(pageName);

    // Verify updated locators
    expect(updatedLocators).toHaveProperty('h1-page-title');
    expect(updatedLocators).toHaveProperty('button-signin-btn');
    expect(updatedLocators).toHaveProperty('input-user-email');
    expect(updatedLocators).toHaveProperty('input-user-password');

    // Use updated locators to interact with the page
    const titleSelector = updatedLocators['h1-page-title'];
    const buttonSelector = updatedLocators['button-signin-btn'];

    await expect(page.locator(titleSelector)).toHaveText('Welcome');
    await expect(page.locator(buttonSelector)).toHaveText('Sign In');
  });
});
