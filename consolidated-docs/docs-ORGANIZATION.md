<!-- Source: /Users/mzahirudeen/playwright-framework/docs/ORGANIZATION.md -->

# Project Organization Guide

## Current Issues

The root directory contains too many files, making it difficult to navigate and maintain. Key issues:

1. Multiple README files with overlapping content
2. Multiple documentation files scattered across the root
3. Multiple summary and report files from recent refactoring
4. Configuration files mixed with documentation

## Recommended Organization

### 1. Documentation Consolidation

Create a structured documentation directory:

```
/docs/
  /guides/           # User guides
    INSTALLATION.md
    RUNNING_TESTS.md
    DOCKER.md
    FEATURES.md
  /reference/        # Reference documentation
    ENV_VARIABLES.md
    API_REFERENCE.md
  /maintenance/      # Maintenance documentation
    CONTRIBUTING.md
    MAINTENANCE.md
  /reports/          # Project reports
    CONSOLIDATION_REPORT.md
    VALIDATION_REPORT.md
```

### 2. Configuration Files

Keep only essential configuration files in the root:

```
/.env.example        # Example environment variables
/.gitignore          # Git ignore file
/package.json        # Package configuration
/playwright.config.js # Playwright configuration
```

### 3. README Consolidation

Consolidate all README files into a single comprehensive README.md with links to detailed documentation:

```
# Playwright Test Framework

## Overview
Brief description of the framework

## Getting Started
- [Installation](docs/guides/INSTALLATION.md)
- [Running Tests](docs/guides/RUNNING_TESTS.md)

## Features
- [Feature List](docs/guides/FEATURES.md)
- [Docker Support](docs/guides/DOCKER.md)

## Documentation
- [Environment Variables](docs/reference/ENV_VARIABLES.md)
- [API Reference](docs/reference/API_REFERENCE.md)

## Contributing
- [Contribution Guide](docs/maintenance/CONTRIBUTING.md)
- [Maintenance Guide](docs/maintenance/MAINTENANCE.md)
```

## Implementation Plan

1. Create the directory structure
2. Consolidate README files
3. Move documentation files to appropriate directories
4. Update links in README.md
5. Remove redundant files from root

## Files to Move/Consolidate

### Documentation Files to Move to /docs/guides/
- HOW-TO-RUN-TESTS.md → RUNNING_TESTS.md
- README-DOCKER.md → DOCKER.md
- README-FEATURES.md → FEATURES.md
- README-RUN-TESTS.md (merge into RUNNING_TESTS.md)
- README-UI-TESTS.md (merge into RUNNING_TESTS.md)
- README-VISUAL-TESTS.md (merge into RUNNING_TESTS.md)
- README-PERFORMANCE-TESTS.md (merge into RUNNING_TESTS.md)

### Documentation Files to Move to /docs/reference/
- ENV_DOCUMENTATION.md → ENV_VARIABLES.md

### Documentation Files to Move to /docs/maintenance/
- CONTRIBUTING.md → CONTRIBUTING.md
- MAINTENANCE_GUIDE.md → MAINTENANCE.md
- VERIFICATION.md (merge into MAINTENANCE.md)

### Documentation Files to Move to /docs/reports/
- CONSOLIDATION_SUMMARY.md → CONSOLIDATION_REPORT.md
- FINAL_REPORT.md (merge into CONSOLIDATION_REPORT.md)
- FINAL_STATUS.md (merge into VALIDATION_REPORT.md)
- FINAL_VALIDATION_REPORT.md → VALIDATION_REPORT.md
- IMPLEMENTATION_SUMMARY.md (merge into VALIDATION_REPORT.md)

### Files to Keep in Root
- .env.example
- .gitignore
- package.json
- playwright.config.js
- README.md (consolidated version)
- LICENSE.md

### Files to Remove (after consolidation)
- Multiple README-*.md files
- Duplicate summary and report files
- HTML files that can be regenerated