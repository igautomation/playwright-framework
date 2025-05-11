#!/usr/bin/env node

/**
 * Script to verify Playwright browser installations
 */
const { chromium, firefox, webkit } = require('playwright');

async function verifyBrowsers() {
  console.log('🔍 Verifying Playwright browser installations...');
  
  const results = {
    chromium: false,
    firefox: false,
    webkit: false
  };
  
  // Check Chromium
  try {
    console.log('Checking Chromium...');
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    results.chromium = true;
    console.log('✅ Chromium is installed and working');
  } catch (error) {
    console.error('❌ Chromium check failed:', error.message);
  }
  
  // Check Firefox
  try {
    console.log('Checking Firefox...');
    const browser = await firefox.launch({ headless: true });
    await browser.close();
    results.firefox = true;
    console.log('✅ Firefox is installed and working');
  } catch (error) {
    console.error('❌ Firefox check failed:', error.message);
  }
  
  // Check WebKit
  try {
    console.log('Checking WebKit...');
    const browser = await webkit.launch({ headless: true });
    await browser.close();
    results.webkit = true;
    console.log('✅ WebKit is installed and working');
  } catch (error) {
    console.error('❌ WebKit check failed:', error.message);
  }
  
  // Summary
  console.log('\n📊 Browser Installation Summary:');
  console.log(`Chromium: ${results.chromium ? '✅ Installed' : '❌ Not installed'}`);
  console.log(`Firefox: ${results.firefox ? '✅ Installed' : '❌ Not installed'}`);
  console.log(`WebKit: ${results.webkit ? '✅ Installed' : '❌ Not installed'}`);
  
  const allInstalled = results.chromium && results.firefox && results.webkit;
  
  if (allInstalled) {
    console.log('\n✅ All browsers are installed and working!');
  } else {
    console.log('\n⚠️ Some browsers are not installed or not working.');
    console.log('Run the following command to install missing browsers:');
    console.log('npx playwright install');
  }
  
  return results;
}

// Run the verification
verifyBrowsers().catch(error => {
  console.error('Error verifying browsers:', error);
  process.exit(1);
});
