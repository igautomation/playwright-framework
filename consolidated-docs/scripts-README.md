<!-- Source: /Users/mzahirudeen/playwright-framework/scripts/README.md -->

# Essential Playwright Framework Scripts

This directory contains the essential scripts needed to run and maintain the Playwright test framework.

## Directory Structure

- `runners/` - Scripts for running different types of tests
  - `run-api-tests.sh` - Run API tests only
  - `run-e2e-tests.sh` - Run end-to-end tests only
  - `run-tests.sh` - Run all tests

- `setup/` - Scripts for setting up the framework
  - `setup.js` - Initial framework setup (directories, env vars, etc.)
  - `setup-hooks.js` - Set up Git hooks for the project

- `utils/` - Utility scripts for framework maintenance
  - `framework-health-check.js` - Check the health of the framework
  - `validate-tests.js` - Validate test quality and best practices
  - `validate-framework.js` - Comprehensive framework validation

- `test-runner.sh` - Interactive CLI wrapper for running tests

## Usage

1. Initial Setup: `node setup/setup.js`
2. Run Tests: `./runners/run-tests.sh`
3. Run API Tests: `./runners/run-api-tests.sh`
4. Run E2E Tests: `./runners/run-e2e-tests.sh`
5. Check Framework Health: `node utils/framework-health-check.js`
6. Validate Tests: `node utils/validate-tests.js`
7. Interactive Test Runner: `./test-runner.sh`
