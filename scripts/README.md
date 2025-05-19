# Scripts Directory

This directory contains utility scripts for the Playwright test framework.

## Directory Structure

The scripts are organized into the following subdirectories:

- **runners/**: Test runner scripts for executing different types of tests
- **setup/**: Scripts for setting up and configuring the environment
- **utils/**: Utility scripts for framework management and validation
- **make-executable/**: Scripts for making other scripts executable

## Main Scripts

- `index.js`: Lists all available scripts with descriptions
- `test-all-scripts.sh`: Tests all scripts for syntax errors
- `verify-organization.js`: Verifies the script organization structure
- `symlinks.js`: Creates symlinks for backward compatibility

## Backward Compatibility

For backward compatibility, symlinks have been created in the root scripts directory that point to the most commonly used scripts in the subdirectories. This ensures that existing references to scripts will continue to work.

## Usage

### Listing Available Scripts

```bash
# List all available scripts with descriptions
npm run scripts:list
# or
node ./scripts/index.js
```

### Testing Scripts

```bash
# Test all scripts for syntax errors
npm run scripts:test
# or
bash ./scripts/test-all-scripts.sh
```

### Verifying Organization

```bash
# Verify the script organization structure
node ./scripts/verify-organization.js
```

### Running Tests

```bash
# Run all tests
./scripts/runners/run-tests.sh
# or use the symlink
./scripts/run-tests.sh
```

## Adding New Scripts

When adding new scripts:

1. Place them in the appropriate subdirectory
2. Add a descriptive comment at the top of the file
3. Make them executable with `chmod +x`
4. Update this README if necessary