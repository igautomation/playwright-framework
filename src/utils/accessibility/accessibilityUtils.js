/**
 * Accessibility testing utilities
 */

/**
 * Get accessibility violations using axe-core
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Array>} Array of accessibility violations
 */
async function getViolations(page) {
  // Inject axe-core library if not already present
  await page.evaluate(async () => {
    if (!window.axe) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js';
      script.onload = () => {
        console.log('axe-core loaded');
      };
      document.head.appendChild(script);
      
      // Wait for script to load
      await new Promise(resolve => {
        const checkAxe = setInterval(() => {
          if (window.axe) {
            clearInterval(checkAxe);
            resolve();
          }
        }, 100);
      });
    }
  });
  
  // Run axe analysis
  const violations = await page.evaluate(async () => {
    const results = await window.axe.run();
    return results.violations;
  });
  
  return violations;
}

module.exports = {
  getViolations
};