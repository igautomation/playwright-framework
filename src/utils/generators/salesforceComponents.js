/**
 * Salesforce Lightning component interactions
 */
module.exports = {
  // Form Components
  form: {
    async fillInput(page, label, value) {
      await page.locator('lightning-input, lightning-textarea')
        .filter({ hasText: label })
        .locator('input, textarea')
        .fill(value);
    },

    async selectLookup(page, label, value) {
      const lookup = page.locator('lightning-lookup').filter({ hasText: label });
      await lookup.locator('input').fill(value);
      await page.locator('.lookup__menu-item').filter({ hasText: value }).first().click();
    },

    async selectPicklist(page, label, value) {
      await page.locator('lightning-combobox, lightning-select').filter({ hasText: label })
        .locator('button, select').click();
      await page.locator('lightning-base-combobox-item').filter({ hasText: value }).click();
    }
  },

  // Table Components
  table: {
    async getTableData(page) {
      return page.locator('lightning-datatable').evaluate(table => {
        return table.getSelectedRows();
      });
    },

    async selectTableRow(page, columnText) {
      await page.locator('lightning-datatable tr')
        .filter({ hasText: columnText })
        .locator('td')
        .first()
        .click();
    }
  },

  // Modal Components
  modal: {
    async waitForModal(page) {
      await page.locator('.modal-container').waitFor({ state: 'visible' });
    },

    async closeModal(page) {
      await page.locator('button.slds-modal__close').click();
    },

    async getModalTitle(page) {
      return page.locator('.modal-container h2').innerText();
    }
  },

  // Navigation Components
  navigation: {
    async openAppLauncher(page) {
      await page.locator('button[data-id="AppLauncher"]').click();
    },

    async selectApp(page, appName) {
      await this.openAppLauncher(page);
      await page.locator('.app-launcher-link').filter({ hasText: appName }).click();
    },

    async openTab(page, tabName) {
      await page.locator('.slds-tabs_default__link').filter({ hasText: tabName }).click();
    }
  },

  // Action Components
  actions: {
    async clickButton(page, label) {
      await page.locator('lightning-button, button.slds-button')
        .filter({ hasText: label })
        .click();
    },

    async openActionMenu(page) {
      await page.locator('lightning-button-menu').click();
    },

    async selectAction(page, actionName) {
      await this.openActionMenu(page);
      await page.locator('lightning-menu-item').filter({ hasText: actionName }).click();
    }
  }
};