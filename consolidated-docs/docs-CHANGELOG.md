<!-- Source: /Users/mzahirudeen/playwright-framework/docs/CHANGELOG.md -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2023-05-15

### Added

- New verification tests for schema validation and navigation error handling

### Changed

- Improved BasePage.navigate method with better error handling and retry logic
- Enhanced LoginPage.navigate method with multiple fallback strategies
- Made verifyLoginSuccess more resilient with multiple verification methods

### Fixed

- Fixed TestDataFactory.generatePayloadFromSchema to properly handle required fields
- Fixed boolean type handling in TestDataFactory to work with different faker versions
- Fixed navigation issues in UI tests with proper error handling and retries
- Fixed schema validation in API tests to ensure all required fields are included

## [1.0.0] - 2023-05-01

### Added

- Initial release of the enterprise-grade Playwright test automation framework
- Page Object Model implementation for UI testing
- POJO serialization with getters/setters for API testing
- CLI with support for tag expressions and listing tags
- Test Data Factory for dynamic data generation
- Self-healing locators for UI testing
- Flaky locator detection
- Network interception utilities
- Screenshot and trace utilities
- Reporting utilities with Allure integration
- Xray integration for test management
- GitHub Actions workflow for CI/CD
- Comprehensive documentation

### Changed

- N/A (initial release)

### Fixed

- N/A (initial release)

## [0.1.0] - 2023-04-15

### Added

- Project scaffolding
- Basic Playwright configuration
- Initial CLI implementation
- Core utilities and base classes

### Changed

- N/A (initial release)

### Fixed

- N/A (initial release)
