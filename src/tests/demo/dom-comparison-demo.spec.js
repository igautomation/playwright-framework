const { test, expect } = require('@playwright/test');
const DOMComparisonUtils = require('../../utils/web/domComparisonUtils');
const fs = require('fs');
const path = require('path');

test.describe('DOM Comparison and Auto-Correction Demo @demo @dom', () => {
  test('Compare DOM snapshots and update locators automatically', async ({
    page,
  }) => {
    // Create DOM comparison utils
    const domComparisonUtils = new DOMComparisonUtils(page);
});

    // Set up initial page content (version 1)
    await page.setContent(`
      <div class="login-form">
        <h1 id="login-title">Login to Your Account</h1>
        <form>
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" placeholder="Enter username" />
          </div>
          <div class="form-group">
            <label for=process.env.PASSWORD>Password</label>
            <input type=process.env.PASSWORD id=process.env.PASSWORD name=process.env.PASSWORD placeholder="Enter password" />
          </div>
          <button type="submit" id="login-button" class="btn-primary">Login</button>
          <a href="/forgot-password" id="forgot-password">Forgot Password?</a>
        </form>
      </div>
    `);

    // Capture initial DOM and extract locators
    const pageName = 'login-form-v1';
    await domComparisonUtils.captureDom(pageName);
    const initialLocators = await domComparisonUtils.extractLocators();

    // Save initial locators
    domComparisonUtils.saveLocators(pageName, initialLocators);

    console.log('Initial locators:', initialLocators);

    // Verify initial locators
    expect(initialLocators).toHaveProperty('h1-login-title');
    expect(initialLocators).toHaveProperty('input-username');
    expect(initialLocators).toHaveProperty('input-password');
    expect(initialLocators).toHaveProperty('button-login-button');
    expect(initialLocators).toHaveProperty('a-forgot-password');

    // Use initial locators to interact with the page
    await page.locator(initialLocators['input-username']).fill('testuser');
    await page.locator(initialLocators['input-password']).fill('password123');
    await page.locator(initialLocators['button-login-button']).click();

    // Now simulate a UI update (version 2) with changed IDs, classes, and structure
    await page.setContent(`
      <div class="auth-container">
        <h1 id="signin-header">Sign In</h1>
        <form class="signin-form">
          <div class="input-group">
            <label for="user-email">Email</label>
            <input type="email" id="user-email" name="email" placeholder="Enter your email" data-testid="email-input" />
          </div>
          <div class="input-group">
            <label for="user-password">Password</label>
            <input type=process.env.PASSWORD id="user-password" name=process.env.PASSWORD placeholder="Enter your password" data-testid="password-input" />
          </div>
          <button type="submit" id="signin-button" class="btn-submit">Sign In</button>
          <div class="links">
            <a href="/reset-password" id="reset-password">Reset Password</a>
            <a href="/register" id="register">Create Account</a>
          </div>
        </form>
      </div>
    `);

    // Compare DOM and update locators
    const updatedLocators =
      await domComparisonUtils.compareAndUpdateLocators(pageName);

    console.log('Updated locators:', updatedLocators);

    // Verify updated locators
    expect(updatedLocators).toHaveProperty('h1-signin-header');
    expect(updatedLocators).toHaveProperty('input-user-email');
    expect(updatedLocators).toHaveProperty('input-user-password');
    expect(updatedLocators).toHaveProperty('button-signin-button');
    expect(updatedLocators).toHaveProperty('a-reset-password');
    expect(updatedLocators).toHaveProperty('a-register');

    // Use updated locators to interact with the page
    await page
      .locator(updatedLocators['input-user-email'])
      .fill('user@example.com');
    await page
      .locator(updatedLocators['input-user-password'])
      .fill('password123');
    await page.locator(updatedLocators['button-signin-button']).click();

    // Find alternative locators for an element
    const alternativeLocators =
      await domComparisonUtils.findAlternativeLocators('#signin-button');
    console.log('Alternative locators for signin button:', alternativeLocators);

    // Verify alternative locators were found
    expect(alternativeLocators.length).toBeGreaterThan(0);

    // Try using one of the alternative locators
    if (alternativeLocators.length > 0) {
      const altLocator = page.locator(alternativeLocators[0]);
      await expect(altLocator).toBeVisible();
    }
  });

  test('Auto-correct locators when DOM changes', async ({ page }) => {
    // Create DOM comparison utils
    const domComparisonUtils = new DOMComparisonUtils(page);

    // Set up initial page content
    await page.setContent(`
      <div class="product-list">
        <h1 id="products-title">Products</h1>
        <div class="filters">
          <input type="text" id="search" placeholder="Search products" />
          <select id="category">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
          </select>
        </div>
        <ul class="products">
          <li class="product" id="product-1">
            <h3>Product 1</h3>
            <p class="price">$99.99</p>
            <button class="add-to-cart" data-product-id="1">Add to Cart</button>
          </li>
          <li class="product" id="product-2">
            <h3>Product 2</h3>
            <p class="price">$149.99</p>
            <button class="add-to-cart" data-product-id="2">Add to Cart</button>
          </li>
        </ul>
      </div>
    `);

    // Capture initial DOM and extract locators
    const pageName = 'product-list-v1';
    await domComparisonUtils.captureDom(pageName);
    const initialLocators = await domComparisonUtils.extractLocators();

    // Save initial locators
    domComparisonUtils.saveLocators(pageName, initialLocators);

    // Verify initial locators
    expect(initialLocators).toHaveProperty('h1-products-title');
    expect(initialLocators).toHaveProperty('input-search');
    expect(initialLocators).toHaveProperty('select-category');

    // Use initial locators
    await page.locator(initialLocators['input-search']).fill('laptop');

    // Now simulate a UI update with changed structure and attributes
    await page.setContent(`
      <div class="product-catalog">
        <header>
          <h1 id="catalog-heading">Product Catalog</h1>
        </header>
        <div class="search-container">
          <input type="text" id="product-search" data-testid="search-input" placeholder="Find products" />
          <div class="dropdown">
            <select id="product-category" data-testid="category-select">
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Kitchen</option>
            </select>
          </div>
        </div>
        <div class="product-grid">
          <div class="product-card" id="product-item-1">
            <h3 class="product-name">Laptop Pro</h3>
            <p class="product-price">$1299.99</p>
            <button class="btn-add-cart" data-product-id="1">Add to Cart</button>
          </div>
          <div class="product-card" id="product-item-2">
            <h3 class="product-name">Smartphone X</h3>
            <p class="product-price">$899.99</p>
            <button class="btn-add-cart" data-product-id="2">Add to Cart</button>
          </div>
        </div>
      </div>
    `);

    // Compare DOM and update locators
    const updatedLocators =
      await domComparisonUtils.compareAndUpdateLocators(pageName);

    // Verify updated locators
    expect(updatedLocators).toHaveProperty('h1-catalog-heading');
    expect(updatedLocators).toHaveProperty('input-product-search');
    expect(updatedLocators).toHaveProperty('select-product-category');

    // Use updated locators
    await page
      .locator(updatedLocators['input-product-search'])
      .fill('smartphone');
    await page
      .locator(updatedLocators['select-product-category'])
      .selectOption('electronics');

    // Verify the interactions worked
    await expect(
      page.locator(updatedLocators['input-product-search'])
    ).toHaveValue('smartphone');
    await expect(
      page.locator(updatedLocators['select-product-category'])
    ).toHaveValue('electronics');

    // Verify locators file was created
    const locatorsPath = path.join(
      domComparisonUtils.locatorsDir,
      `${pageName}.json`
    );
    expect(fs.existsSync(locatorsPath)).toBeTruthy();

    // Load the saved locators and verify they match
    const savedLocators = JSON.parse(fs.readFileSync(locatorsPath, 'utf8'));
    expect(savedLocators).toEqual(updatedLocators);
  });
});
