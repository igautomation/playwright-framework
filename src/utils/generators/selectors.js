/**
 * Comprehensive selector patterns and component interactions
 * Consolidated with Salesforce components
 */
module.exports = {
  // General Web Elements
  generalElements: {
    form: [
      "input[type='text']",
      "input[type='password']",
      "input[type='email']",
      "input[type='search']",
      "input[type='url']",
      "input[type='tel']",
      "input[type='number']",
      "input[type='checkbox']",
      "input[type='radio']",
      "input[type='file']",
      "input[type='submit']",
      "input[type='reset']",
      "textarea",
      "select",
      "button",
      "label",
      "fieldset",
      "legend",
      "datalist",
      "keygen",
      "output",
      "progress",
      "meter",
      "form"
    ],
    interactive: [
      "a[href]", 
      "button", 
      "details", 
      "summary", 
      "dialog",
      "menu",
      "menuitem",
      "nav",
      "[class*='btn']",
      "[class*='dropdown']",
      "[class*='menu']"
    ],
    content: [
      "h1", "h2", "h3", "h4", "h5", "h6", 
      "p", "div", "span", 
      "blockquote", "pre", "code",
      "header", "footer", "main", "section", "article", "aside",
      "ul", "ol", "li",
      "img", "video", "audio", "source", "track", "picture", 
      "iframe", "canvas", "svg"
    ],
    table: [
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col"
    ],
    meta: [
      "meta", "link", "script", "style", "title", "base", "noscript"
    ]
  },

  // Salesforce Elements
  salesforceElements: {
    standard: [
      "input[type='text']",
      "input[type='password']",
      "input[type='email']",
      "input[type='checkbox']",
      "input[type='radio']",
      "input[type='date']",
      "input[type='number']",
      "textarea",
      "select",
      "button",
      "a[href]",
      "label"
    ],
    lightning: [
      "lightning-input",
      "lightning-button",
      "lightning-combobox",
      "lightning-textarea",
      "lightning-checkbox-group",
      "lightning-radio-group",
      "lightning-input-field",
      "lightning-output-field",
      "lightning-datatable",
      "lightning-tabset",
      "lightning-tab",
      "lightning-accordion",
      "lightning-card",
      "lightning-icon",
      "lightning-badge",
      "lightning-chip",
      "lightning-tree",
      "lightning-tree-item",
      "lightning-pill",
      "lightning-slider"
    ],
    slds: [
      ".slds-input",
      ".slds-button",
      ".slds-button_icon",
      ".slds-checkbox",
      ".slds-radio",
      ".slds-combobox",
      ".slds-textarea",
      ".slds-modal",
      ".slds-card",
      ".slds-table",
      ".slds-grid",
      ".slds-icon",
      ".slds-badge",
      ".slds-spinner",
      ".slds-popover"
    ],
    aura: [
      "[class*='uiInput']",
      "[class*='uiButton']",
      "[class*='forceChatter']",
      "[class*='forceRecordLayout']",
      "[aura\\:id]",
      "[data-aura-rendered-by]"
    ],
    lookup: [
      ".lookup__input",
      ".lookup__menu",
      ".slds-combobox__input",
      ".slds-combobox__menu",
      ".slds-listbox__option",
      "[data-value]",
      "[data-selected]",
      "[role='option']",
      "[role='combobox']"
    ],
    modal: [
      ".slds-modal",
      ".slds-modal__header",
      ".slds-modal__content",
      ".slds-modal__footer",
      ".slds-notify",
      ".slds-toast",
      ".forceActionsText",
      "[role='alert']"
    ]
  },

  // Common Attributes
  commonAttributes: {
    aria: [
      "[role]", 
      "[aria-label]", 
      "[aria-labelledby]", 
      "[aria-describedby]",
      "[aria-hidden]",
      "[aria-expanded]",
      "[role='button']",
      "[role='dialog']",
      "[role='tab']",
      "[role='menuitem']"
    ],
    data: [
      "[data-testid]", 
      "[data-test]", 
      "[data-qa]", 
      "[data-id]",
      "[data-cy]",
      "[data-name]",
      "[data-target-selection-name]",
      "[data-component-id]"
    ],
    other: [
      "[title]",
      "[placeholder]",
      "[name]",
      "[id^='input-']",
      "[id*='-field']",
      "[id*='-form']",
      "[class*='dynamic']",
      "[class*='editable']",
      "[class*='card']",
      "[class*='input']",
      "[class*='form']",
      "[class*='table']",
      "[class*='modal']"
    ]
  },

  // Salesforce Component Interactions
  componentActions: {
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
        await page.locator('button[data-id="AppLauncher"]').click();
        await page.locator('.app-launcher-link').filter({ hasText: appName }).click();
      },

      async openTab(page, tabName) {
        await page.locator('.slds-tabs_default__link').filter({ hasText: tabName }).click();
      }
    },

    // Basic Actions
    async fillLightningInput(page, label, value) {
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

    async selectCombobox(page, label, value) {
      await page.locator('lightning-combobox').filter({ hasText: label })
        .locator('button').click();
      await page.locator('lightning-base-combobox-item')
        .filter({ hasText: value }).click();
    },

    async clickButton(page, label) {
      await page.locator('lightning-button, button.slds-button')
        .filter({ hasText: label })
        .click();
    }
  },

  /**
   * Get selectors based on mode and type
   */
  getSelectors({ mode = 'general', types = [] } = {}) {
    let selectors = [];

    // Add common attributes
    Object.values(this.commonAttributes).forEach(group => {
      selectors.push(...group);
    });

    // Add mode-specific selectors
    if (mode === 'general' || mode === 'hybrid') {
      if (types.length === 0) {
        Object.values(this.generalElements).forEach(group => {
          selectors.push(...group);
        });
      } else {
        types.forEach(type => {
          if (this.generalElements[type]) {
            selectors.push(...this.generalElements[type]);
          }
        });
      }
    }

    if (mode === 'salesforce' || mode === 'hybrid') {
      Object.values(this.salesforceElements).forEach(group => {
        selectors.push(...group);
      });
    }

    return [...new Set(selectors)];
  }
};