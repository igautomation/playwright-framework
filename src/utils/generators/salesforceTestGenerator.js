const { test, expect } = require('@playwright/test');

/**
 * Salesforce page layouts and configurations
 */
const SALESFORCE_CONFIG = {
  // Record Types
  recordTypes: {
    Contact: {
      baseUrl: '/lightning/o/Contact',
      newUrl: '/lightning/o/Contact/new',
      listUrl: '/lightning/o/Contact/list'
    },
    Account: {
      baseUrl: '/lightning/o/Account',
      newUrl: '/lightning/o/Account/new',
      listUrl: '/lightning/o/Account/list'
    },
    Opportunity: {
      baseUrl: '/lightning/o/Opportunity',
      newUrl: '/lightning/o/Opportunity/new',
      listUrl: '/lightning/o/Opportunity/list'
    }
  },

  // Page Layouts
  layouts: {
    list: 'list',
    new: 'new',
    view: 'view',
    edit: 'edit',
    related: 'related'
  },

  // URL Patterns
  getUrl(objectName, layout, recordId = '', recordTypeId = '') {
    const base = `/lightning/o/${objectName}`;
    switch (layout) {
      case 'list': return `${base}/list`;
      case 'new': return `${base}/new${recordTypeId ? `?recordTypeId=${recordTypeId}` : ''}`;
      case 'view': return `/lightning/r/${objectName}/${recordId}/view`;
      case 'edit': return `/lightning/r/${objectName}/${recordId}/edit`;
      case 'related': return `/lightning/r/${objectName}/${recordId}/related`;
      default: return base;
    }
  }
};

/**
 * Salesforce-specific assertions
 */
const assertions = {
  async assertToastMessage(page, expectedMessage) {
    await expect(page.locator('div.toastMessage')).toContainText(expectedMessage);
  },

  async assertRecordCreated(page) {
    await expect(page.locator('div.forceToastMessage')).toContainText('created');
  },

  async assertFieldError(page, fieldLabel, errorMessage) {
    const field = page.locator('lightning-input').filter({ hasText: fieldLabel });
    await expect(field.locator('.slds-form-element__help')).toContainText(errorMessage);
  }
};

/**
 * Generates a test suite for Salesforce page
 */
function generateSalesforceTest({ 
  testName, 
  recordType, 
  layout = 'new',
  credentials, 
  testFunction, 
  recordTypeId,
  recordId
}) {
  test.describe(testName, () => {
    test.beforeEach(async ({ page }) => {
      const salesforcePage = new (require('../../pages/SalesforcePage'))(page);
      
      // Handle authentication
      await salesforcePage.goto();
      await salesforcePage.fillusername(credentials.username);
      await salesforcePage.fillpw(credentials.password);
      await salesforcePage.clicklogin();
      await page.waitForLoadState('networkidle');

      // Navigate to specific page layout
      if (recordType) {
        const url = SALESFORCE_CONFIG.getUrl(recordType, layout, recordId, recordTypeId);
        await page.goto(url);
        await page.waitForLoadState('networkidle');
      }
    });

    test('Execute test', async ({ page }) => {
      const salesforcePage = new (require('../../pages/SalesforcePage'))(page);
      await testFunction(salesforcePage, page, assertions);
    });
  });
}

module.exports = {
  generateSalesforceTest,
  SALESFORCE_CONFIG
};