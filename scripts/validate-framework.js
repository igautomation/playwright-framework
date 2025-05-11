#!/usr/bin/env node

/**
 * Framework Validation Script
 * 
 * This script runs a comprehensive validation of the framework:
 * 1. Runs the framework health check
 * 2. Runs all validation tests
 * 3. Generates a validation dashboard
 * 4. Outputs a summary of the results
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Framework Validation');

// Track validation results
const results = {
  healthCheck: {
    passed: 0,
    warnings: 0,
    failed: 0,
    status: 'pending'
  },
  tests: {
    passed: 0,
    failed: 0,
    skipped: 0,
    status: 'pending'
  }
};

// Helper function to run a command and handle errors
function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return { success: true, output };
  } catch (error) {
    console.error(`❌ ${description} failed: ${error.message}`);
    return { success: false, error };
  }
}

// Step 1: Run framework health check
const healthCheck = runCommand('node scripts/framework-health-check.js', 'Running framework health check');
results.healthCheck.status = healthCheck.success ? 'passed' : 'failed';

// Step 2: Run validation tests
const validationTests = runCommand('npx playwright test --grep @validation', 'Running validation tests');
results.tests.status = validationTests.success ? 'passed' : 'failed';

// Step 3: Generate validation dashboard
const dashboard = runCommand('node scripts/generate-validation-dashboard.js', 'Generating validation dashboard');

// Step 4: Parse results from dashboard
try {
  const dashboardPath = path.resolve(__dirname, '../reports/validation/dashboard.html');
  if (fs.existsSync(dashboardPath)) {
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    // Parse health check results
    const passedMatches = dashboardContent.match(/Passed Checks.*?<div class="metric">(\d+)<\/div>/s);
    const warningsMatches = dashboardContent.match(/Warnings.*?<div class="metric">(\d+)<\/div>/s);
    const failedMatches = dashboardContent.match(/Failed Checks.*?<div class="metric">(\d+)<\/div>/s);
    
    results.healthCheck.passed = passedMatches ? parseInt(passedMatches[1]) : 0;
    results.healthCheck.warnings = warningsMatches ? parseInt(warningsMatches[1]) : 0;
    results.healthCheck.failed = failedMatches ? parseInt(failedMatches[1]) : 0;
    
    // Parse test results
    const testPassedMatches = dashboardContent.match(/Passed Tests.*?<div class="metric">(\d+)<\/div>/s);
    const testFailedMatches = dashboardContent.match(/Failed Tests.*?<div class="metric">(\d+)<\/div>/s);
    const testSkippedMatches = dashboardContent.match(/Skipped Tests.*?<div class="metric">(\d+)<\/div>/s);
    
    results.tests.passed = testPassedMatches ? parseInt(testPassedMatches[1]) : 0;
    results.tests.failed = testFailedMatches ? parseInt(testFailedMatches[1]) : 0;
    results.tests.skipped = testSkippedMatches ? parseInt(testSkippedMatches[1]) : 0;
  }
} catch (error) {
  console.error(`❌ Error parsing dashboard: ${error.message}`);
}

// Step 5: Output summary
console.log('\n📊 Framework Validation Summary');
console.log('==============================');
console.log('Health Check:');
console.log(`  ✅ Passed: ${results.healthCheck.passed}`);
console.log(`  ⚠️ Warnings: ${results.healthCheck.warnings}`);
console.log(`  ❌ Failed: ${results.healthCheck.failed}`);
console.log(`  Status: ${results.healthCheck.status.toUpperCase()}`);
console.log('\nValidation Tests:');
console.log(`  ✅ Passed: ${results.tests.passed}`);
console.log(`  ❌ Failed: ${results.tests.failed}`);
console.log(`  ⏭️ Skipped: ${results.tests.skipped}`);
console.log(`  Status: ${results.tests.status.toUpperCase()}`);

console.log('\n📋 Validation Report:');
console.log(`  📄 ${path.resolve(__dirname, '../reports/validation/dashboard.html')}`);

// Step 6: Exit with appropriate code
if (results.healthCheck.failed > 0 || results.tests.failed > 0) {
  console.log('\n❌ Framework validation FAILED!');
  process.exit(1);
} else if (results.healthCheck.warnings > 0) {
  console.log('\n⚠️ Framework validation PASSED WITH WARNINGS!');
  process.exit(0);
} else {
  console.log('\n✅ Framework validation PASSED!');
  process.exit(0);
}