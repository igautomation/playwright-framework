# Scripts Directory

This directory contains utility scripts for the Playwright test framework.

## Recent Changes

The following improvements have been made to the scripts in this directory:

1. **Added Missing Utilities**
   - Created a `utils` directory within the scripts folder
   - Implemented `xray-integration.js` with proper ES module exports
   - Added functions for Xray test case management: `getXrayTestCases`, `saveTestCasesToFile`, and `generateTestFiles`

2. **Fixed Path Handling**
   - Updated all scripts to use `path.resolve(process.cwd(), ...)` instead of relative paths
   - This ensures scripts work correctly regardless of where they are executed from

3. **Improved Error Handling**
   - Added fallback for logger in framework-health-check.js
   - Added better error messages and handling for missing files
   - Changed utility class checks to show warnings instead of errors for missing files

4. **Enhanced Security**
   - Modified env-check.js to mask sensitive environment variables in logs
   - Added proper validation for environment variables

5. **Made Scripts More Robust**
   - Updated make-scripts-executable.sh to use `find` for more reliable script discovery
   - Made both .sh and .js files executable

## Available Scripts

- **cli-check.js**: Command-line interface for the test framework
- **env-check.js**: Validates and loads environment variables
- **framework-health-check.js**: Comprehensive check of framework components
- **make-scripts-executable.sh**: Makes all scripts executable
- **utils/xray-integration.js**: Utilities for Xray test management integration

## Usage

Most scripts can be run directly:

```bash
# Make scripts executable first
./scripts/make-scripts-executable.sh

# Run framework health check
./scripts/framework-health-check.js

# Check environment variables
node ./scripts/env-check.js

# Use CLI
node ./scripts/cli-check.js --help
```

## Testing

Tests for these scripts are available in `/tests/scripts/utils-test.js`.