<!-- Source: /Users/mzahirudeen/playwright-framework/docs/MAINTENANCE_GUIDE.md -->

# Test Framework Maintenance Guide

This guide outlines the procedures for maintaining the test framework and ensuring code quality.

## Regular Maintenance Tasks

### 1. Run Validation Script

The validation script checks all test files for best practices:

```bash
npm run validate
```

Run this script:
- Before committing changes
- After adding new test files
- During code reviews

### 2. Update Environment Variables

When adding new external resources or URLs:

1. Add the variable to `.env` file
2. Add the variable to `.env.example` file
3. Update `ENV_DOCUMENTATION.md` with the new variable
4. Update the GitHub workflow file with the new variable

### 3. Run Tests Regularly

Run tests regularly to ensure they continue to work:

```bash
# Run all tests
npm test

# Run specific test types
npm run test:smoke
npm run test:api
npm run test:visual
npm run test:accessibility
```

### 4. Update Dependencies

Regularly update dependencies to ensure security and compatibility:

```bash
npm update
```

## Git Hooks

The framework includes Git hooks to enforce best practices:

### Pre-commit Hook

The pre-commit hook runs the validation script before each commit:

```bash
# Install Git hooks
npm run setup-hooks
```

This hook is automatically installed during `npm install`.

## CI/CD Integration

The GitHub workflow runs validation and tests on push and pull requests:

- `test-validation.yml`: Validates test files and runs sample tests

## Best Practices

1. **No Hard-Coded Credentials**: Use environment variables for all credentials
2. **No Hard-Coded URLs**: Use environment variables for all URLs
3. **Proper Test Structure**: Use test.describe blocks for all tests
4. **No setTimeout Usage**: Use proper waiting mechanisms
5. **Consistent Naming**: Follow the naming conventions for test files and functions
6. **Documentation**: Keep documentation up to date

## Troubleshooting

If validation fails:

1. Check the error message for details
2. Fix the issues in the specified files
3. Run the validation script again
4. If needed, use the fix scripts:
   - `fix-hardcoded-urls.js`
   - `fix-complex-delays.js`
   - `fix-missing-describe.js`