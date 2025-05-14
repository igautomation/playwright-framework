# Advanced Test Runner

This document provides detailed instructions on how to use the advanced test runner in this repository.

## Overview

The advanced test runner (`advanced-test-runner.sh`) is a comprehensive script that provides a wide range of options to customize your test runs. It allows you to run tests folder by folder, with various configuration options for browsers, parallelization, reporting, and more.

## Usage

### Basic Usage

To run all tests with default settings:

```bash
./advanced-test-runner.sh
```

Or using npm:

```bash
npm run test:advanced
```

### Running Tests in a Specific Browser

```bash
./advanced-test-runner.sh --browser firefox
```

Available options: `chromium` (default), `firefox`, `webkit`, or `all`

### Running Tests in Headed Mode

```bash
./advanced-test-runner.sh --headed
```

### Controlling Parallel Execution

```bash
./advanced-test-runner.sh --workers 4
```

### Retrying Failed Tests

```bash
./advanced-test-runner.sh --retries 2
```

### Generating Reports

```bash
./advanced-test-runner.sh --report
```

You can also specify a reporter:

```bash
./advanced-test-runner.sh --reporter html
```

Available reporters: `list` (default), `dot`, `line`, `json`, `html`

### Running in Debug Mode

```bash
./advanced-test-runner.sh --debug
```

### Configuring Trace and Video Recording

```bash
./advanced-test-runner.sh --trace on --video retain-on-failure
```

Trace options: `on`, `off`, `on-first-retry` (default), `on-all-retries`
Video options: `on`, `off`, `retain-on-failure` (default)

### Running Tests in a Specific Folder

```bash
./advanced-test-runner.sh --folder api
```

### Running Tests Matching a Pattern

```bash
./advanced-test-runner.sh --test "login.*"
```

### Running in Non-Interactive Mode

By default, the runner pauses between folders. To run without pausing:

```bash
./advanced-test-runner.sh --non-interactive
```

### Updating Visual Test Snapshots

```bash
./advanced-test-runner.sh --update-snapshots
```

### Sharding Tests

```bash
./advanced-test-runner.sh --shard 1/3
```

### Pattern Matching

```bash
./advanced-test-runner.sh --grep "smoke" --grep-invert "slow"
```

### Setting Timeouts

```bash
./advanced-test-runner.sh --timeout 60000 --timeout-global 3600000
```

### Showing Browser Console Logs

```bash
./advanced-test-runner.sh --console
```

### Stopping After First Failure

```bash
./advanced-test-runner.sh --fail-fast
```

### Controlling Output Verbosity

```bash
./advanced-test-runner.sh --verbose
```

Or for minimal output:

```bash
./advanced-test-runner.sh --quiet
```

### Skipping Specific Folders

```bash
./advanced-test-runner.sh --skip fixtures --skip logs
```

## Common Use Cases

### For Quick Development Cycles

```bash
./advanced-test-runner.sh --browser chromium --folder ui --test "feature-x" --fail-fast --headed
```

### For Comprehensive CI Testing

```bash
./advanced-test-runner.sh --browser all --workers 4 --retries 2 --report --non-interactive
```

### For Visual Regression Testing

```bash
./advanced-test-runner.sh --folder visual --update-snapshots --headed
```

### For Performance Testing

```bash
./advanced-test-runner.sh --folder performance --workers 1 --timeout 120000 --video on
```

## Getting Help

To see all available options:

```bash
./advanced-test-runner.sh --help
```

## Integration with CI/CD

For CI/CD pipelines, consider this configuration:

```bash
./advanced-test-runner.sh --browser all --workers 4 --retries 2 --report --non-interactive --trace on-first-retry --video retain-on-failure
```

This runs tests across all browsers with reasonable parallelization, retries flaky tests, generates comprehensive reports, and captures traces and videos for failures.