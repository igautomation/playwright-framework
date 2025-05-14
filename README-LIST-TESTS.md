# Listing Tests

This document explains how to list all available tests in the Playwright framework without running them.

## Using Playwright CLI

The simplest way to list all tests is to use the Playwright CLI:

```bash
# List all tests
npx playwright test --list

# List tests for a specific project
npx playwright test --list --project=chromium

# List tests matching a specific tag or pattern
npx playwright test --list --grep=@smoke
```

## Using npm Scripts

We've added convenience scripts to package.json:

```bash
# List all tests
npm run test:list

# Make the list-tests.sh script executable
npm run make:list-tests-executable

# List tests using the shell script
npm run list:tests
```

## Using Framework CLI

The framework CLI provides a dedicated command for listing tests:

```bash
# List all tests
npx playwright-framework list-tests

# List tests for a specific project
npx playwright-framework list-tests --project=chromium

# List tests matching a specific tag or pattern
npx playwright-framework list-tests --tags=@smoke
```

## Using Shell Script

A shell script is provided for listing tests:

```bash
# Make the script executable
chmod +x list-tests.sh

# List all tests
./list-tests.sh

# List tests for a specific project
./list-tests.sh --project=chromium

# List tests matching a specific tag or pattern
./list-tests.sh --tags=@smoke

# Show help
./list-tests.sh --help
```

## Output Format

The output will show all available tests grouped by project. For example:

```
Running 42 tests using 5 workers

  ✓ [chromium] › src/tests/api/reqres-api.spec.js:5:1 › Reqres API Tests › should get a list of users
  ✓ [chromium] › src/tests/api/reqres-api.spec.js:15:1 › Reqres API Tests › should get a single user
  ✓ [chromium] › src/tests/api/reqres-api.spec.js:25:1 › Reqres API Tests › should create a new user
  ...
```

## Filtering Tests

You can filter tests by:

1. **Project** - Use `--project` to filter by browser or test group
2. **Tags/Patterns** - Use `--grep` to filter by test title or tags

### Available Projects

The following projects are defined in the framework:

- `chromium` - Tests running in Chromium browser
- `firefox` - Tests running in Firefox browser
- `webkit` - Tests running in WebKit browser
- `api` - API tests
- `ui` - UI tests
- `e2e` - End-to-end tests
- `visual` - Visual tests

### Using Tags

You can tag your tests using the test title:

```javascript
test('@smoke should login successfully', async ({ page }) => {
  // Test code
});
```

Then filter by tag:

```bash
npx playwright test --list --grep=@smoke
```

## Troubleshooting

If you encounter issues with listing tests:

1. Make sure you have installed all dependencies:
   ```bash
   npm install
   ```

2. Make sure you have installed Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Check that your test files follow the naming convention (*.spec.js)

4. Verify that the test directory path in playwright.config.js is correct