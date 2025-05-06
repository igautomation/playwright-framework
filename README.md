# Playwright Testing Framework

A comprehensive framework for web automation, testing, and reporting using Playwright.

## Features

- **Cross-browser Testing**: Run tests on Chromium, Firefox, and WebKit
- **API Testing**: Test REST and GraphQL APIs
- **Visual Testing**: Compare screenshots for visual regression testing
- **Performance Testing**: Measure page load times and resource usage
- **Accessibility Testing**: Check WCAG compliance
- **Localization Testing**: Test multilingual applications
- **Reporting**: Generate HTML and Allure reports
- **CI/CD Integration**: Ready for GitHub Actions and other CI systems

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/playwright-framework.git
cd playwright-framework

# Install dependencies
npm install

# Install browsers
npx playwright install
```

## Project Structure

```
playwright-framework/
├── examples/                # Example tests and usage patterns
├── locales/                 # Localization files
├── reports/                 # Test reports
│   ├── accessibility/       # Accessibility test reports
│   ├── allure/              # Allure reports
│   ├── html/                # HTML reports
│   ├── performance/         # Performance test reports
│   └── visual/              # Visual test reports
├── src/
│   ├── cli/                 # Command-line interface tools
│   ├── config/              # Configuration files
│   ├── dashboard/           # Test dashboard
│   ├── pages/               # Page objects
│   ├── tests/               # Test files
│   │   ├── accessibility/   # Accessibility tests
│   │   ├── api/             # API tests
│   │   ├── localization/    # Localization tests
│   │   ├── performance/     # Performance tests
│   │   ├── ui/              # UI tests
│   │   └── visual/          # Visual tests
│   └── utils/               # Utility functions
│       ├── accessibility/   # Accessibility testing utilities
│       ├── api/             # API testing utilities
│       ├── common/          # Common utilities
│       ├── localization/    # Localization utilities
│       ├── performance/     # Performance testing utilities
│       ├── reporting/       # Reporting utilities
│       ├── visual/          # Visual testing utilities
│       └── web/             # Web testing utilities
├── traces/                  # Playwright traces
├── visual-baselines/        # Visual test baselines
└── visual-diffs/            # Visual test differences
```

## Usage

### Running Tests

```bash
# Run all tests
npm run test:playwright

# Run specific test types
npm run test:api
npm run test:ui
npm run test:visual
npm run test:accessibility
npm run test:performance
npm run test:localization

# Run tests with specific tags
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

### Visual Testing

```javascript
const { test, expect } = require('@playwright/test');
const VisualComparisonUtils = require('../../utils/visual/visualComparisonUtils');

test('Homepage visual comparison', async ({ page }) => {
  const visualUtils = new VisualComparisonUtils(page);
  await page.goto('https://example.com');
  const result = await visualUtils.compareScreenshot('homepage');
  expect(result.match).toBe(true);
});
```

### Performance Testing

```javascript
const { test, expect } = require('@playwright/test');
const PerformanceUtils = require('../../utils/performance/performanceUtils');

test('Page load performance', async ({ page }) => {
  const perfUtils = new PerformanceUtils(page);
  const result = await perfUtils.measurePageLoad('https://example.com');
  expect(result.loadTime).toBeLessThan(5000);
});
```

### Accessibility Testing

```javascript
const { test, expect } = require('@playwright/test');
const AccessibilityUtils = require('../../utils/accessibility/accessibilityUtils');

test('Homepage accessibility audit', async ({ page }) => {
  const accessibilityUtils = new AccessibilityUtils(page);
  await page.goto('https://example.com');
  const result = await accessibilityUtils.audit();
  expect(result.issues.length).toBe(0);
});
```

### Localization Testing

```javascript
const { test, expect } = require('@playwright/test');
const LocalizationUtils = require('../../utils/localization/localizationUtils');

test('Compare locales', async ({ browser }) => {
  const localizationUtils = new LocalizationUtils(page);
  const result = await localizationUtils.compareLocales(
    'https://example.com', 
    ['en', 'fr', 'es']
  );
  expect(result.comparisonResults.fr.missingTranslations.length).toBe(0);
});
```

## Generating Reports

```bash
# Generate HTML report
npm run report

# Open Allure report
npx allure open reports/allure
```

## Dashboard

```bash
# Start the dashboard
npm run dashboard
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.