---
sidebar_position: 2
---

# Installation

This guide will walk you through the process of installing and setting up the Playwright Framework in your project.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (version 6 or higher) or **yarn** (version 1.22 or higher)
- **Git** (optional, for version control)

## Installation Options

There are two ways to install the Playwright Framework:

1. **As a dependency in an existing project**
2. **Creating a new project with the framework**

### Option 1: Install as a Dependency

To add the Playwright Framework to an existing project, run:

```bash
# Using npm
npm install @your-org/playwright-framework --save-dev

# Using yarn
yarn add @your-org/playwright-framework --dev
```

After installation, initialize the framework in your project:

```bash
npx framework init
```

This will create the necessary directory structure and configuration files in your project.

### Option 2: Create a New Project

To create a new project with the Playwright Framework:

```bash
# Create a new directory
mkdir my-test-project
cd my-test-project

# Initialize a new npm project
npm init -y

# Install the framework
npm install @your-org/playwright-framework --save-dev

# Initialize the framework
npx framework init
```

## Installing Playwright Browsers

After installing the framework, you need to install the Playwright browsers:

```bash
npx playwright install --with-deps
```

This command installs the Chromium, Firefox, and WebKit browsers that Playwright will use for testing.

## Configuration

The framework uses a `.env` file for configuration. Create this file based on the provided example:

```bash
cp .env.example .env
```

Edit the `.env` file to configure your environment:

```
# Base URLs for different environments
BASE_URL=https://your-application-url.com
API_URL=https://your-api-url.com

# Test credentials
USERNAME=your-username
PASSWORD=your-password

# Browser configuration
BROWSER=chromium
HEADLESS=true

# Test configuration
RETRIES=1
WORKERS=50%
```

## Verify Installation

To verify that the framework is installed correctly, run:

```bash
npx framework test --list
```

This should list all the available tests in your project.

## Next Steps

Now that you have installed the Playwright Framework, you can:

1. Check out the [Quick Start](quick-start) guide to write your first test
2. Learn about the [Configuration](configuration) options
3. Explore the [API Reference](../api/cli) for more details on the available commands and utilities
