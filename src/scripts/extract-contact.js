const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Login
    await page.goto('https://login.salesforce.com');
    await page.fill('#username', 'altimetrikuser001@wise-koala-a44c19.com');
    await page.fill('#password', 'Dubai@2025');
    await page.click('#Login');
    await page.waitForLoadState('networkidle');

    // Go to Contact page
    await page.goto('https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('force-record-layout-section');

    // Extract form fields
    const fields = await page.evaluate(() => {
      const sections = document.querySelectorAll('force-record-layout-section');
      return Array.from(sections).map(section => ({
        title: section.querySelector('h3')?.textContent?.trim(),
        fields: Array.from(section.querySelectorAll('force-record-layout-item')).map(item => ({
          label: item.querySelector('label')?.textContent?.trim(),
          required: item.querySelector('abbr[title="Required"]') !== null,
          type: item.querySelector('input, select, textarea')?.tagName?.toLowerCase()
        }))
      }));
    });

    console.log(JSON.stringify(fields, null, 2));
  } finally {
    await browser.close();
  }
})();