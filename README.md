# Playwright Test Framework

A comprehensive, modular test automation framework built with Playwright.

## Features

- **Page Object Model**: Structured approach to creating maintainable tests
- **Data-Driven Testing**: Run tests with different data sets
- **API Testing**: Test REST and GraphQL APIs
- **Visual Testing**: Compare screenshots for visual regression
- **Accessibility Testing**: Validate WCAG compliance
- **Cross-Browser Testing**: Run tests on Chrome, Firefox, and Safari
- **Mobile Testing**: Test on mobile viewports
- **Performance Testing**: Measure and validate performance metrics
- **Reporting**: Generate comprehensive test reports

## Directory Structure

```
playwright-framework/
├── scripts/               # Utility scripts
│   ├── runners/           # Test runner scripts
│   ├── setup/             # Setup scripts
│   ├── utils/             # Utility scripts
│   └── make-executable/   # Scripts to make other scripts executable
├── src/
│   ├── config/            # Configuration files
│   ├── data/              # Test data
│   │   ├── json/          # JSON test data
│   │   └── csv/           # CSV test data
│   ├── pages/             # Page objects
│   ├── tests/             # Test files
│   │   ├── core/          # Core functionality tests
│   │   ├── examples/      # Example tests
│   │   └── validation/    # Framework validation tests
│   └── utils/             # Utility functions
│       ├── accessibility/ # Accessibility testing utilities
│       ├── api/           # API testing utilities
│       └── web/           # Web testing utilities
├── playwright.config.js   # Playwright configuration
└── package.json           # Project dependencies
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-framework.git
cd playwright-framework

# Install dependencies
npm install

# Install browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:core
npm run test:examples
npm run test:validation

# Run tests with specific configurations
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:mobile

# Run optimized tests
npm run test:optimized
npm run test:fast
npm run test:parallel
```

## Core Tests

The framework includes essential tests that demonstrate key functionality:

- **Navigation**: Basic page navigation and assertions
- **Authentication**: Login flows and session management
- **API Integration**: API request and response validation
- **Visual Regression**: Screenshot comparison
- **Accessibility**: WCAG compliance testing
- **Mobile Responsiveness**: Testing on different viewport sizes
- **Form Validation**: Input validation and form submission
- **Error Handling**: Testing error states and recovery
- **Performance**: Load time and resource usage testing

## Example Tests

Example tests demonstrate how to use specific framework features:

- **Data-Driven Testing**: Running tests with different data sets
- **API Mocking**: Mocking API responses for testing
- **Custom Fixtures**: Creating and using custom test fixtures
- **Cross-Browser Testing**: Handling browser-specific behavior
- **Reporting Integration**: Generating custom test reports

## Validation Tests

Validation tests ensure the framework itself is working correctly:

- **Framework Components**: Validating core framework components
- **Configuration**: Verifying configuration settings
- **Plugin System**: Testing the plugin system functionality

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.