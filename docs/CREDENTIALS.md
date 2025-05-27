# Credential Management Guide

This guide explains how to securely manage credentials in the Playwright Framework.

## Overview

The framework provides a secure credential management system that:

1. Avoids hard-coding credentials in test files
2. Securely stores encrypted credentials locally
3. Supports environment variables for CI/CD environments
4. Provides a simple setup utility for managing credentials

## Setting Up Credentials

### Option 1: Using the Setup Utility

The framework includes a setup utility to help you manage credentials:

```bash
# Run the setup utility
node setup-credentials.js
```

This interactive utility will guide you through setting up credentials for:
- OrangeHRM
- Salesforce
- Reqres API

### Option 2: Using Environment Variables

You can set environment variables to provide credentials:

```bash
# OrangeHRM
export ORANGE_HRM_USERNAME=Admin
export ORANGE_HRM_PASSWORD=your_password

# Salesforce
export SALESFORCE_USERNAME=your_username
export SALESFORCE_PASSWORD=your_password

# Reqres API
export REQRES_API_KEY=your_api_key
```

For persistent environment variables, add them to your shell profile or use a `.env` file.

### Option 3: Using .env Files

Create a `.env` file in the project root:

```
# OrangeHRM
ORANGE_HRM_USERNAME=Admin
ORANGE_HRM_PASSWORD=your_password

# Salesforce
SALESFORCE_USERNAME=your_username
SALESFORCE_PASSWORD=your_password

# Reqres API
REQRES_API_KEY=your_api_key
```

The framework will automatically load these variables.

## Credential Priority

The framework uses the following priority order for credentials:

1. Environment variables (highest priority)
2. Encrypted secrets file (second priority)
3. Default values (lowest priority, for development only)

## Security Best Practices

1. Never commit credentials to version control
2. Use environment variables in CI/CD environments
3. Set a strong encryption key via the `ENCRYPTION_KEY` environment variable
4. Regularly rotate credentials
5. Use the minimum required permissions for test accounts

## Encryption Key

For enhanced security, set a custom encryption key:

```bash
export ENCRYPTION_KEY="your-secure-random-key"
```

Without a custom key, the default key will be used, which is less secure.

## Troubleshooting

If you encounter credential issues:

1. Verify environment variables are set correctly
2. Run the setup utility again to update stored credentials
3. Check for typos in credential names
4. Ensure the `.playwright-secrets` file exists and has proper permissions

For additional help, contact the framework maintainers.