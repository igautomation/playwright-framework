# Installation Guide

This guide explains how to install and set up the Playwright test framework.

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- Git

## Basic Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/playwright-framework.git
   cd playwright-framework
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to configure your environment variables.

## Docker Installation

If you prefer to use Docker, you can use the provided Docker configuration:

```bash
docker-compose up
```

For more details on Docker setup, see [Docker Guide](DOCKER.md).

## Configuration

The framework uses several configuration files:

- `playwright.config.js`: Main Playwright configuration
- `.env`: Environment variables
- `package.json`: npm scripts and dependencies

## Verification

To verify your installation:

```bash
npm run validate
```

This will check that all test files follow best practices.

## Next Steps

After installation, you can:

- [Run tests](RUNNING_TESTS.md)
- [Explore features](FEATURES.md)
- [Contribute to the project](../maintenance/CONTRIBUTING.md)