# Playwright Testing Framework

A comprehensive testing framework built on top of Playwright for end-to-end, API, and accessibility testing.

## Distribution

This framework can be distributed as a bundled package to clients and end users with the following benefits:

### Easy Installation

The framework is packaged with a simple installation script:

```bash
# Download the bundle and extract it
unzip playwright-framework-1.0.0.zip

# Run the installation script
./install.sh --create-project my-test-project
```

This will:
1. Install the framework globally
2. Create a new project with sample structure
3. Set up all necessary configurations

### Protected Source Code

The distributed framework:
- Contains only compiled/minified code
- Exposes a clean API without revealing implementation details
- Protects proprietary testing logic and utilities

### Sample Project Structure

The bundle includes a sample project with:

```
sample-project/
├── tests/              # Test files
├── pages/              # Page objects
├── fixtures/           # Test data
├── utils/              # Utility functions
├── reports/            # Test reports
├── .env.example        # Environment configuration
├── playwright.config.js # Playwright configuration
└── package.json        # Project dependencies
```

## For Framework Developers

To create a distribution bundle:

1. Trigger the "Create Distribution Bundle" workflow from GitHub Actions
2. Provide a version number when prompted
3. Download the generated ZIP file from the workflow artifacts

## Documentation

For detailed documentation, visit our [GitHub Pages site](https://your-username.github.io/playwright-framework/).