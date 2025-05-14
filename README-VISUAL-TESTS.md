# Visual Regression Testing

This document explains how to run visual regression tests and how the automatic failure fixing works.

## Overview

Visual regression tests compare screenshots of UI elements or pages against baseline images to detect visual changes. The tests are located in:

- `/src/tests/visual/` - Core visual regression tests
- `/src/tests/ui/visual/` - UI-specific visual tests

## Running Visual Tests

To run all visual tests and automatically fix failures:

```bash
# Make the script executable first
chmod +x ./run-visual-tests.sh

# Run the tests
./run-visual-tests.sh
```

You can also run the tests directly using Playwright:

```bash
# Run all visual tests using the visual project configuration
npx playwright test --project=visual

# Run with automatic baseline updates
PLAYWRIGHT_VISUAL_UPDATE_BASELINES=1 npx playwright test --project=visual
```

## What the Script Does

1. **Removes Duplicate Tests**: Identifies and removes duplicate visual tests between different directories
2. **Creates Required Directories**: Sets up directories for baselines and diffs
3. **Enables Automatic Baseline Updates**: Configures the system to automatically update baselines when tests fail
4. **Runs Visual Tests**: Executes all tests using the dedicated visual project configuration
5. **Fixes Failures**: If tests fail, it runs them again with baseline updates enabled
6. **Resets Configuration**: Returns the configuration to its original state

## Project Configuration

A dedicated project configuration for visual tests has been added to `playwright.config.js`:

```javascript
{
  name: 'visual',
  testMatch: /.*visual.*\.spec\.js/,
  testDir: './src/tests',
  use: {
    ...devices['Desktop Chrome'],
    screenshot: 'on',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 45000,
    navigationTimeout: 60000,
  },
}
```

This configuration:
- Matches all test files containing "visual" in their name
- Uses a consistent viewport size for reliable comparisons
- Increases timeouts to accommodate visual comparison operations
- Enables screenshots for all tests

## How Automatic Fixing Works

The visual comparison utility (`VisualComparisonUtils`) has been enhanced to support automatic baseline updates when tests fail. This can be controlled through:

1. **Environment Variable**: Set `PLAYWRIGHT_VISUAL_UPDATE_BASELINES=1` to enable automatic updates
2. **YAML Configuration**: Set `updateBaselines: true` in `src/data/yaml/visual-test-config.yaml`
3. **Constructor Option**: Pass `updateBaselines: true` when creating a `VisualComparisonUtils` instance

When automatic updates are enabled:
- If a test fails due to dimension mismatches, the baseline is updated with the new dimensions
- If a test fails due to visual differences, the baseline is updated with the current screenshot

## Duplicate Test Detection

The system identifies duplicate tests based on:
- Test names containing similar keywords (e.g., "homepage", "home page")
- When duplicates are found, tests in `/src/tests/visual/` are preferred over those in `/src/tests/ui/visual/`

## Manual Intervention

If tests continue to fail after automatic fixes, manual intervention may be required. Common issues include:

1. **Selector Changes**: If element selectors have changed, update them in the test files
2. **Expected Visual Changes**: If the UI has intentionally changed, review and approve the new baselines
3. **Environment Differences**: Ensure tests run in consistent environments to avoid false positives

## Generating Visual Reports

Visual test results can be viewed in the Playwright HTML report. Additionally, the `VisualComparisonUtils.generateReport()` method can be used to create custom visual comparison reports.