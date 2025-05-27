<!-- Source: /Users/mzahirudeen/playwright-framework/docs/CONSOLIDATION_SUMMARY.md -->

# Test Consolidation Summary

This document summarizes the consolidation of duplicate test files in the Playwright framework.

## Consolidation Groups

### 1. Accessibility Tests

**Consolidated File**: `./src/tests/accessibility/accessibility.spec.js`

**Original Files**:
- `./src/tests/accessibility/accessibility-test.spec.js`
- `./src/tests/accessibility/accessibilityTest.spec.js`
- `./src/tests/accessibility/basic-a11y.spec.js`
- `./src/tests/accessibility/simple-accessibility.spec.js`
- `./src/tests/core/accessibility.spec.js`

**Benefits**:
- Single source of truth for accessibility testing
- Consistent approach to accessibility validation
- Reduced duplication of test setup and assertions

### 2. OrangeHRM UI Tests

**Consolidated File**: `./src/tests/ui/orangehrm.spec.js`

**Original Files**:
- `./src/tests/orangehrm-test.spec.js`
- `./src/tests/ui/orangehrm-ui.spec.js`
- `./src/tests/ui/orangehrm-ui-fixed.spec.js`

**Benefits**:
- Unified approach to OrangeHRM UI testing
- Consistent page object usage
- Reduced duplication of login and navigation tests

### 3. Visual Regression Tests

**Consolidated File**: `./src/tests/visual/visual-regression.spec.js`

**Original Files**:
- `./src/tests/visual/visual-test.spec.js`
- `./src/tests/visual/visualRegressionTest.spec.js`
- `./src/tests/core/visual-regression.spec.js`

**Benefits**:
- Unified approach to visual regression testing
- Consistent screenshot comparison methodology
- Reduced duplication of screenshot capture logic

### 4. API-UI Integration Tests

**Consolidated File**: `./src/tests/integration/api-ui.spec.js`

**Original Files**:
- `./src/tests/combined-api-ui-test.spec.js`
- `./src/tests/combined/api-ui-combined.spec.js`
- `./src/tests/ui/api-ui-test.spec.js`
- `./src/tests/integration/api-ui-integration.spec.js`

**Benefits**:
- Unified approach to API-UI integration testing
- Consistent API client usage
- Reduced duplication of API request and UI verification logic

## Backup Strategy

All original files have been moved to backup directories:
- `src/tests/accessibility/backup/`
- `src/tests/ui/backup/`
- `src/tests/visual/backup/`
- `src/tests/integration/backup/`

This ensures that no test functionality is lost during the consolidation process.

## Next Steps

1. **Review Consolidated Tests**: Ensure that all test functionality has been properly consolidated
2. **Update Documentation**: Update test documentation to reflect the new consolidated test structure
3. **Run Tests**: Run the consolidated tests to ensure they function correctly
4. **Remove Backups**: Once confident in the consolidated tests, remove the backup files