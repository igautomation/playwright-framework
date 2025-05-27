# Security Utilities

This directory contains utilities for handling security-related functionality in the Playwright framework.

## Credential Manager

The `credentialManager.js` module provides secure handling of credentials for tests. It supports:

- Reading credentials from environment variables
- Securely storing and retrieving credentials from an encrypted file
- Encryption and decryption of sensitive data

### Usage

```javascript
const CredentialManager = require('../utils/security/credentialManager');

// Initialize credential manager
const credentialManager = new CredentialManager({
  envPrefix: 'TEST_' // Optional prefix for environment variables
});

// Get a credential (checks env vars first, then secure storage)
const password = credentialManager.getCredential('ORANGE_HRM_PASSWORD', 'default_password');

// Store a credential securely
credentialManager.storeCredential('ORANGE_HRM_PASSWORD', 'secure_password');
```

## Best Practices

1. Never hard-code credentials in test files
2. Use environment variables for CI/CD environments
3. Use the credential manager for local development
4. Set a strong encryption key via the `ENCRYPTION_KEY` environment variable
5. Keep the `.playwright-secrets` file out of version control (add to .gitignore)

## Security Configuration

The framework uses a layered approach to credential management:

1. Environment variables (highest priority)
2. Encrypted secrets file (second priority)
3. Default values (lowest priority, for development only)

For production use, ensure all credentials are provided via environment variables or the secure storage mechanism.