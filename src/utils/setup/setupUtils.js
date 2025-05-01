// src/utils/setup/setupUtils.js

import { execSync } from 'child_process';

class SetupUtils {
  installPlaywrightVSCode() {
    try {
      execSync('code --install-extension ms-playwright.playwright', {
        stdio: 'inherit'
      });
      console.log('Playwright VS Code extension installed successfully');
    } catch (error) {
      throw new Error(`Failed to install Playwright VS Code extension: ${error.message}`);
    }
  }

  configureRetry(retries) {
    if (typeof retries !== 'number' || retries < 0 || !Number.isInteger(retries)) {
      throw new Error('Retries must be a non-negative integer');
    }
    console.log(`Configured Playwright to retry tests ${retries} times`);
    process.env.PLAYWRIGHT_RETRIES = retries.toString();
  }
}

export default SetupUtils;
