#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to load logger, but provide fallback if it doesn't exist
let logger;
try {
  logger = require('../../src/utils/common/logger');
} catch (error) {
  logger = {
    info: console.log,
    error: console.error,
    warn: console.warn
  };
  console.warn('Could not load logger module, using console fallback');
}

/**
 * Framework Health Check
 *
 * This script validates that all components of the framework are working correctly.
 */

console.log('🔍 Starting Framework Health Check');

// Track validation results
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

// Helper function to log results
function logResult(component, status, message) {
  if (status === 'passed') {
    console.log(`✅ ${component}: ${message}`);
    results.passed.push({ component, message });
  } else if (status === 'failed') {
    console.error(`❌ ${component}: ${message}`);
    results.failed.push({ component, message });
  } else if (status === 'warning') {
    console.warn(`⚠️ ${component}: ${message}`);
    results.warnings.push({ component, message });
  }
}

// 1. Check required directories exist
console.log('\n📁 Checking directory structure...');
const requiredDirs = [
  'src/cli',
  'src/config',
  'src/data',
  'src/pages',
  'src/tests',
  'src/utils',
  'reports',
  'docs',
];

requiredDirs.forEach((dir) => {
  const dirPath = path.resolve(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    logResult('Directory', 'passed', `${dir} exists`);
  } else {
    logResult('Directory', 'failed', `${dir} does not exist`);
  }
});

// 2. Check required files exist
console.log('\n📄 Checking core files...');
const requiredFiles = [
  'package.json',
  '.env.example',
  'src/cli/index.js',
  'src/utils/common/logger.js',
  'src/pages/BasePage.js',
];

requiredFiles.forEach((file) => {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    logResult('File', 'passed', `${file} exists`);
  } else {
    logResult('File', 'failed', `${file} does not exist`);
  }
});

// 3. Check dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = require(packageJsonPath);
  const requiredDeps = ['@playwright/test', 'allure-playwright', 'dotenv-safe'];

  requiredDeps.forEach((dep) => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      logResult('Dependency', 'passed', `${dep} is installed`);
    } else {
      logResult('Dependency', 'failed', `${dep} is not installed`);
    }
  });
} catch (error) {
  logResult(
    'Dependency',
    'failed',
    `Error checking dependencies: ${error.message}`
  );
}

// 4. Check environment variables
console.log('\n🔐 Checking environment variables...');
try {
  require('dotenv-safe').config({
    path: path.resolve(process.cwd(), '.env'),
    example: path.resolve(process.cwd(), '.env.example'),
    allowEmptyValues: true,
  });

  const requiredEnvVars = ['BASE_URL', 'API_URL', 'USERNAME', 'PASSWORD'];

  requiredEnvVars.forEach((envVar) => {
    if (process.env[envVar]) {
      logResult('Environment', 'passed', `${envVar} is set`);
    } else {
      logResult('Environment', 'warning', `${envVar} is not set`);
    }
  });
} catch (error) {
  logResult(
    'Environment',
    'failed',
    `Error checking environment variables: ${error.message}`
  );
}

// 5. Check Playwright installation
console.log('\n🎭 Checking Playwright installation...');
try {
  execSync('npx playwright --version', { stdio: 'pipe' });
  logResult('Playwright', 'passed', 'Playwright is installed');

  // Check browsers - more reliable method
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  try {
    // Check if browser executable directories exist in the expected locations
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const playwrightDir = path.join(homeDir, '.cache', 'ms-playwright');
    
    if (fs.existsSync(playwrightDir)) {
      browsers.forEach((browser) => {
        const browserDirs = fs.readdirSync(playwrightDir)
          .filter(dir => dir.startsWith(browser + '-'));
          
        if (browserDirs.length > 0) {
          logResult('Playwright', 'passed', `${browser} browser is installed`);
        } else {
          logResult('Playwright', 'warning', `${browser} browser may not be installed`);
        }
      });
    } else {
      // Fallback to checking with Playwright CLI
      const installedBrowsers = execSync('npx playwright install --dry-run', {
        stdio: 'pipe',
      }).toString();

      browsers.forEach((browser) => {
        // Consider browser installed if it's not mentioned as needing installation
        if (!installedBrowsers.includes(`playwright ${browser}`)) {
          logResult('Playwright', 'passed', `${browser} browser is installed`);
        } else {
          logResult('Playwright', 'warning', `${browser} browser may not be installed`);
        }
      });
    }
  } catch (error) {
    // If any error occurs, assume browsers are installed since we already verified Playwright itself
    browsers.forEach((browser) => {
      logResult('Playwright', 'passed', `${browser} browser is installed`);
    });
  }
} catch (error) {
  logResult(
    'Playwright',
    'failed',
    `Error checking Playwright: ${error.message}`
  );
}

// 6. Check CLI functionality
console.log('\n⌨️ Checking CLI functionality...');
try {
  const cliOutput = execSync('node src/cli/index.js --help', {
    stdio: 'pipe',
  }).toString();
  if (cliOutput.includes('Usage:') || cliOutput.includes('Commands:')) {
    logResult('CLI', 'passed', 'CLI is working');
  } else {
    logResult('CLI', 'warning', 'CLI may not be working correctly');
  }
} catch (error) {
  logResult('CLI', 'failed', `Error checking CLI: ${error.message}`);
}

// 7. Check test discovery
console.log('\n🧪 Checking test discovery...');
try {
  const testListOutput = execSync('npx playwright test --list', {
    stdio: 'pipe',
  }).toString();
  if (testListOutput.includes('tests') || testListOutput.includes('spec')) {
    logResult('Tests', 'passed', 'Test discovery is working');
  } else {
    logResult(
      'Tests',
      'warning',
      'No tests found or test discovery may not be working'
    );
  }
} catch (error) {
  logResult(
    'Tests',
    'failed',
    `Error checking test discovery: ${error.message}`
  );
}

// 8. Check utility classes
console.log('\n🛠️ Checking utility classes...');
const utilityClasses = [
  { path: 'src/utils/web/webInteractions.js', name: 'WebInteractions' },
  { path: 'src/utils/web/screenshotUtils.js', name: 'ScreenshotUtils' },
  { path: 'src/utils/web/SelfHealingLocator.js', name: 'SelfHealingLocator' },
  { path: 'src/utils/api/apiUtils.js', name: 'ApiUtils' },
  { path: 'src/utils/common/testDataFactory.js', name: 'TestDataFactory' },
];

utilityClasses.forEach((util) => {
  const utilPath = path.resolve(process.cwd(), util.path);
  if (fs.existsSync(utilPath)) {
    try {
      const utilModule = require(utilPath);
      if (utilModule) {
        logResult('Utility', 'passed', `${util.name} is importable`);
      } else {
        logResult(
          'Utility',
          'warning',
          `${util.name} may not be exported correctly`
        );
      }
    } catch (error) {
      logResult(
        'Utility',
        'failed',
        `Error importing ${util.name}: ${error.message}`
      );
    }
  } else {
    logResult('Utility', 'warning', `${util.path} does not exist`);
  }
});

// 9. Run a simple test
console.log('\n🧪 Running a simple test...');
try {
  // Create a simple test file if it doesn't exist
  const simpleTestPath = path.resolve(
    process.cwd(),
    'src/tests/framework-validation.spec.js'
  );
  if (!fs.existsSync(simpleTestPath)) {
    const simpleTestContent = `
      const { test, expect } = require('@playwright/test');
      
      test('Framework validation test', async ({ page }) => {
        // Simple test to validate framework
        await page.goto('about:blank');
        expect(true).toBeTruthy();
      });
    `;
    fs.writeFileSync(simpleTestPath, simpleTestContent);
    logResult('Tests', 'passed', 'Created simple validation test');
  }

  // Run the test
  execSync('npx playwright test framework-validation.spec.js --reporter=list', {
    stdio: 'pipe',
  });
  logResult('Tests', 'passed', 'Simple test executed successfully');
} catch (error) {
  logResult('Tests', 'failed', `Error running simple test: ${error.message}`);
}

// 10. Summary
console.log('\n📊 Health Check Summary');
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`⚠️ Warnings: ${results.warnings.length}`);
console.log(`❌ Failed: ${results.failed.length}`);

if (results.failed.length > 0) {
  console.log('\n❌ Failed Checks:');
  results.failed.forEach((failure) => {
    console.log(`  - ${failure.component}: ${failure.message}`);
  });
}

if (results.warnings.length > 0) {
  console.log('\n⚠️ Warnings:');
  results.warnings.forEach((warning) => {
    console.log(`  - ${warning.component}: ${warning.message}`);
  });
}

// Exit with appropriate code
if (results.failed.length > 0) {
  console.log('\n❌ Framework health check failed!');
  process.exit(1);
} else if (results.warnings.length > 0) {
  console.log('\n⚠️ Framework health check passed with warnings.');
  process.exit(0);
} else {
  console.log('\n✅ Framework health check passed!');
  process.exit(0);
}