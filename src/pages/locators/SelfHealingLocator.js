// src/pages/locators/SelfHealingLocator.js

class SelfHealingLocator {
  constructor(page, primarySelector, options = {}) {
    this.page = page;
    this.primarySelector = primarySelector;
    this.options = {
      fallbackStrategies: options.fallbackStrategies || [],
      timeout: options.timeout || 5000,
      logHealing: options.logHealing !== false, // Default to true
    };
    this.locator = page.locator(primarySelector);
  }

  // Try to locate the element, falling back to alternative strategies if needed
  async locate() {
    try {
      // First, try the primary selector
      await this.locator.waitFor({
        state: "visible",
        timeout: this.options.timeout,
      });
      return this.locator;
    } catch (error) {
      if (this.options.logHealing) {
        console.warn(
          `Primary selector "${this.primarySelector}" failed: ${error.message}`
        );
      }

      // Try fallback strategies
      for (const strategy of this.options.fallbackStrategies) {
        try {
          const fallbackLocator = this.page.locator(strategy.selector);
          await fallbackLocator.waitFor({
            state: "visible",
            timeout: this.options.timeout,
          });

          if (this.options.logHealing) {
            console.log(
              `Healed locator: Using fallback "${strategy.selector}" for "${this.primarySelector}"`
            );
          }
          return fallbackLocator;
        } catch (fallbackError) {
          if (this.options.logHealing) {
            console.warn(
              `Fallback selector "${strategy.selector}" failed: ${fallbackError.message}`
            );
          }
        }
      }

      throw new Error(
        `Unable to locate element with "${this.primarySelector}" or any fallback selectors`
      );
    }
  }

  // Helper to create a self-healing locator with common strategies
  static create(page, primarySelector, elementDescription) {
    const fallbackStrategies = [];

    // Fallback 1: Use text content if the element has known text
    if (elementDescription.text) {
      fallbackStrategies.push({
        selector: `text=${elementDescription.text}`,
      });
    }

    // Fallback 2: Use role and name (Playwright's ARIA role selectors)
    if (elementDescription.role && elementDescription.name) {
      fallbackStrategies.push({
        selector: `[role="${elementDescription.role}"][name="${elementDescription.name}"]`,
      });
    }

    // Fallback 3: Use a broader CSS selector (e.g., by tag or partial class)
    if (elementDescription.tag) {
      fallbackStrategies.push({
        selector: elementDescription.tag,
      });
    }

    return new SelfHealingLocator(page, primarySelector, {
      fallbackStrategies,
    });
  }
}

module.exports = SelfHealingLocator;
