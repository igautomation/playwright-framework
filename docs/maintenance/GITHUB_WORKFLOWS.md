# GitHub Workflows

This document describes the GitHub workflows used in the project.

## Available Workflows

### 1. Test Validation

**File:** `.github/workflows/test-validation.yml`

**Purpose:** Validates test files for best practices and runs sample tests.

**Triggers:**
- Push to main branch
- Pull request to main branch
- Manual trigger (workflow_dispatch)

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Validate tests using the validation script
5. Create .env file with all required environment variables
6. Install Playwright browsers
7. Run sample tests
8. Upload test results as artifacts

**Usage:**
```bash
# Trigger manually from GitHub Actions tab
# Or automatically on push/pull request
```

### 2. Framework Validation

**File:** `.github/workflows/framework-validation.yml`

**Purpose:** Validates the framework functionality.

**Triggers:**
- Push to main/master branch
- Pull request to main/master branch
- Manual trigger with browser selection

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Install Playwright browsers
5. Create .env file
6. Run framework health check
7. Run framework validation tests
8. Generate validation report
9. Upload validation report and test results
10. Check test status

**Usage:**
```bash
# Trigger manually with browser selection
# Or automatically on push/pull request
```

### 3. Verify All Tests

**File:** `.github/workflows/verify-all-tests.yml`

**Purpose:** Verifies all tests in the framework.

**Triggers:**
- Push to main/master branch
- Pull request to main/master branch
- Manual trigger with debug option

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Install Playwright browsers
5. Create .env file
6. Run test functionality verification
7. Verify all tests
8. Upload test reports

**Usage:**
```bash
# Trigger manually with debug option
# Or automatically on push/pull request
```

### 4. Playwright Tests

**File:** `.github/workflows/playwright.yml`

**Purpose:** Runs Playwright tests in Docker containers.

**Triggers:**
- Push to main branch
- Pull request to main branch

**Steps:**
1. Checkout code
2. Create .env file
3. Create Dockerfile
4. Set up Docker Buildx
5. Build Docker image
6. Run API tests with JSON data
7. Run data-driven tests with CSV data
8. Run visual tests with YAML configuration
9. Run accessibility tests
10. Run XML data tests
11. Generate report
12. Upload test results

**Usage:**
```bash
# Automatically on push/pull request
```

## Adding a New Workflow

To add a new workflow:

1. Create a new YAML file in `.github/workflows/`
2. Define the triggers (on)
3. Define the jobs and steps
4. Test the workflow by pushing to a branch

## Best Practices

1. **Environment Variables**: Use environment variables for sensitive information
2. **Artifacts**: Upload test results and reports as artifacts
3. **Caching**: Use caching for dependencies to speed up workflows
4. **Conditional Steps**: Use conditional steps to handle failures
5. **Matrix Testing**: Use matrix testing for multiple configurations

## Troubleshooting

If a workflow fails:

1. Check the workflow logs in GitHub Actions
2. Verify that all environment variables are set correctly
3. Check that all dependencies are installed
4. Verify that the tests are running correctly locally