/**
 * Localization tests using the LocalizationUtils
 */
const { test, expect } = require('@playwright/test');
const LocalizationUtils = require('../../utils/localization/localizationUtils');

test.describe('Localization Tests @localization', () => {
  let localizationUtils;
  
  test.beforeEach(async ({ page }) => {
    localizationUtils = new LocalizationUtils(page, {
      outputDir: './reports/localization',
      localesDir: './locales',
      defaultLocale: 'en'
    });
  });
  
  test('Extract text content from page', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Extract text content
    const result = await localizationUtils.extractText({
      outputPath: './reports/localization/extracted-text.json'
    });
    
    // Log the results
    console.log(`Extracted text from ${result.url}`);
    console.log(`Detected locale: ${result.locale}`);
    console.log(`Text elements found: ${Object.keys(result.textContent).length}`);
    
    // Assert that text was extracted
    expect(Object.keys(result.textContent).length).toBeGreaterThan(0, 'Should extract text content from the page');
  });
  
  test('Compare locales', async ({ browser }) => {
    // Define locales to test
    const locales = ['en', 'fr', 'es', 'de'];
    
    // Compare locales
    const result = await localizationUtils.compareLocales('https://example.com', locales, {
      screenshot: true,
      generateReport: true,
      reportPath: './reports/localization/locale-comparison.html'
    });
    
    // Log the results
    console.log(`Compared ${locales.length} locales`);
    
    // Check for missing translations in each locale
    for (const locale of locales) {
      if (locale === result.defaultLocale) continue;
      
      const missingCount = result.comparisonResults[locale].missingTranslations.length;
      console.log(`${locale}: ${missingCount} missing translations`);
      
      // Assert on missing translations (adjust threshold as needed)
      expect(missingCount).toBeLessThan(10, `${locale} should have fewer than 10 missing translations`);
    }
  });
  
  test('Set page locale', async ({ page }) => {
    // Set locale to French
    await localizationUtils.setLocale('fr-FR');
    
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Extract text content
    const result = await localizationUtils.extractText();
    
    // Assert that the locale was set correctly
    expect(result.locale).toContain('fr', 'Page locale should be set to French');
  });
  
  test('Export translations', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Extract text content
    const result = await localizationUtils.extractText();
    
    // Export translations
    const localePath = await localizationUtils.exportTranslations(
      result.textContent,
      'en',
      { keyFormat: 'selector' }
    );
    
    // Log the results
    console.log(`Exported translations to ${localePath}`);
    
    // Assert that the file was created
    expect(localePath).toBeTruthy('Should export translations to a file');
  });
  
  test('Test multilingual form', async ({ browser }) => {
    // Define locales to test
    const locales = ['en', 'fr'];
    const formSelectors = {
      name: 'input[name="name"]',
      email: 'input[name="email"]',
      submit: 'button[type="submit"]'
    };
    
    // Expected labels for each locale
    const expectedLabels = {
      en: {
        name: 'Name',
        email: 'Email',
        submit: 'Submit'
      },
      fr: {
        name: 'Nom',
        email: 'E-mail',
        submit: 'Envoyer'
      }
    };
    
    // Test each locale
    for (const locale of locales) {
      // Create a new context with the specified locale
      const context = await browser.newContext({
        locale
      });
      
      const page = await context.newPage();
      
      // Create a new localization utils instance for this page
      const locUtils = new LocalizationUtils(page, {
        defaultLocale: 'en'
      });
      
      // Navigate to the form page
      await page.goto('https://example.com/contact');
      
      // Wait for the form to be visible
      await page.waitForSelector('form', { state: 'visible' });
      
      // Extract text content
      const result = await locUtils.extractText();
      
      // Check form labels
      for (const [field, selector] of Object.entries(formSelectors)) {
        const label = await page.locator(`label[for="${field}"]`).textContent();
        expect(label.trim()).toBe(expectedLabels[locale][field], 
          `${field} label should be correctly translated in ${locale}`);
      }
      
      // Close the context
      await context.close();
    }
  });
});