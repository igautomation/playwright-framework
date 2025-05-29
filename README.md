# Playwright Testing Framework

A comprehensive testing framework built with Playwright for web and API testing, including Salesforce automation.

## Features

- Page Object Model architecture
- Data-driven testing
- API testing capabilities
- Salesforce automation
- Reporting and screenshots
- Environment-based configuration
- Utility functions for common operations

## Getting Started

### Prerequisites

- Node.js 14 or higher
- npm or yarn
- Salesforce credentials (for Salesforce tests)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials.

## Running Tests

### All Tests

```bash
npm test
```

### Salesforce Tests

```bash
npm run test:salesforce
```

### API Tests

```bash
npm run test:api
```

### E2E Tests

```bash
npm run test:e2e
```

## Salesforce Testing

The framework includes comprehensive support for Salesforce testing:

### UI Testing

- Login functionality
- Account management
- Contact management
- Lead management
- Opportunity management

### API Testing

- CRUD operations for Salesforce objects
- Query operations
- Authentication

### Configuration

Salesforce configuration is managed through environment variables and the `src/config/salesforce.config.js` file.

## Project Structure

```
playwright-framework/
├── auth/                  # Authentication state storage
├── data/                  # Test data files
│   ├── json/              # JSON test data
│   └── salesforce-*.json  # Salesforce test data
├── src/
│   ├── config/            # Configuration files
│   ├── pages/             # Page objects
│   │   └── salesforce/    # Salesforce page objects
│   ├── tests/             # Test files
│   │   └── salesforce/    # Salesforce tests
│   └── utils/             # Utility functions
│       └── salesforce/    # Salesforce utilities
├── .env                   # Environment variables
├── .env.example           # Example environment variables
├── playwright.config.js   # Playwright configuration
└── package.json           # Project dependencies
```

## Best Practices

- Use Page Object Model for UI tests
- Store test data in separate JSON files
- Use environment variables for credentials
- Follow the DRY principle
- Write descriptive test names
- Use proper assertions
- Handle errors gracefully

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.