# Framework Distribution

This guide explains how to distribute the Playwright Framework to end users or clients.

## Creating a Distribution Bundle

The framework can be packaged as a distributable bundle that includes:
- The core framework (with protected source code)
- A sample project structure
- Installation scripts

### Using GitHub Actions

1. Go to the GitHub repository Actions tab
2. Select the "Create Distribution Bundle" workflow
3. Click "Run workflow"
4. Enter a version number (e.g., "1.0.0")
5. Download the artifact when the workflow completes

### Creating Locally

You can also create the bundle locally:

```bash
# Run the bundle creation script
node scripts/create-bundle.js 1.0.0
```

The bundle will be created in the `dist` directory.

## Bundle Contents

The distribution bundle includes:

```
playwright-framework-1.0.0.zip
├── framework/           # The framework package
│   ├── lib/             # Core framework code (protected)
│   ├── bin/             # CLI tools
│   ├── sample/          # Sample project template
│   └── package.json     # Framework package definition
├── sample-project/      # Ready-to-use sample project
│   ├── tests/           # Sample tests
│   ├── pages/           # Sample page objects
│   └── ...              # Other project files
└── install.sh           # Installation script
```

## Installation for End Users

End users can install the framework with these simple steps:

1. Extract the bundle:
   ```bash
   unzip playwright-framework-1.0.0.zip
   ```

2. Run the installation script:
   ```bash
   # Install framework only
   ./install.sh
   
   # Install framework and create a project
   ./install.sh --create-project my-test-project
   ```

3. Set up the project:
   ```bash
   cd my-test-project
   npm install
   npx playwright install
   ```

4. Run the sample tests:
   ```bash
   npm test
   ```

## Source Code Protection

The distributed framework protects your source code through:

1. **Minification**: Code is minified to reduce size and improve performance
2. **Obfuscation**: Variable names and logic are obfuscated to prevent reverse engineering
3. **API Abstraction**: Implementation details are hidden behind a clean API
4. **Compiled Assets**: Any sensitive algorithms are compiled to prevent inspection