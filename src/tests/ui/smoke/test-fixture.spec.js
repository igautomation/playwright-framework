/**
 * Test fixture example
 */
const { test, expect } = require('@playwright/test');
const ProductPage = require('../../../pages/ProductPage');

test.describe('Product Page Tests', () => {
  let productPage;

  test.beforeEach(async ({ page }) => {
    productPage = new ProductPage(page);
    await page.goto(`${process.env.AUTOMATION_EXERCISE_URL}/products`);
  });

  test('should display product categories', async ({ page }) => {
    // Check that categories are displayed
    await expect(productPage.categoriesSection).toBeVisible();
    
    // Check that there are multiple categories
    const categoriesCount = await productPage.categoriesList.count();
    expect(categoriesCount).toBeGreaterThan(0);
  });

  test('should filter products by category', async ({ page }) => {
    // Click on a category
    await productPage.clickCategory('Women');
    
    // Check that products are filtered
    await expect(productPage.categoryTitle).toContainText('Women');
    
    // Check that products are displayed
    const productsCount = await productPage.productsList.count();
    expect(productsCount).toBeGreaterThan(0);
  });

  test('should search for products', async ({ page }) => {
    // Search for a product
    await productPage.searchProduct('dress');
    
    // Check that search results are displayed
    await expect(productPage.searchResultsTitle).toContainText('Searched Products');
    
    // Check that products are displayed
    const productsCount = await productPage.productsList.count();
    expect(productsCount).toBeGreaterThan(0);
  });
});