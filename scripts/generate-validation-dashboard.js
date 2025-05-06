#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Generate a framework validation dashboard
 */

// Run health check and capture output
console.log('Running framework health check...');
let healthCheckOutput;
try {
  healthCheckOutput = execSync('node scripts/framework-health-check.js', {
    stdio: 'pipe',
  }).toString();
} catch (error) {
  healthCheckOutput = error.stdout ? error.stdout.toString() : error.message;
}

// Run validation tests and capture output
console.log('Running validation tests...');
let validationTestOutput;
try {
  validationTestOutput = execSync(
    'npx playwright test --grep @validation --reporter=list',
    { stdio: 'pipe' }
  ).toString();
} catch (error) {
  validationTestOutput = error.stdout ? error.stdout.toString() : error.message;
}

// Parse health check results
const passedMatches = healthCheckOutput.match(/✅ Passed: (\d+)/);
const warningsMatches = healthCheckOutput.match(/⚠️ Warnings: (\d+)/);
const failedMatches = healthCheckOutput.match(/❌ Failed: (\d+)/);

const passed = passedMatches ? parseInt(passedMatches[1]) : 0;
const warnings = warningsMatches ? parseInt(warningsMatches[1]) : 0;
const failed = failedMatches ? parseInt(failedMatches[1]) : 0;

// Parse test results
const testPassedMatches = validationTestOutput.match(/(\d+) passed/);
const testFailedMatches = validationTestOutput.match(/(\d+) failed/);
const testSkippedMatches = validationTestOutput.match(/(\d+) skipped/);

const testPassed = testPassedMatches ? parseInt(testPassedMatches[1]) : 0;
const testFailed = testFailedMatches ? parseInt(testFailedMatches[1]) : 0;
const testSkipped = testSkippedMatches ? parseInt(testSkippedMatches[1]) : 0;

// Check component versions
const versions = {
  node: process.version,
  npm: execSync('npm --version', { stdio: 'pipe' }).toString().trim(),
  playwright: require('@playwright/test/package.json').version,
  framework: require('../package.json').version,
};

// Check test coverage (placeholder since we don't have actual coverage data)
const coverageData = {
  statements: 'N/A',
  branches: 'N/A',
  functions: 'N/A',
  lines: 'N/A',
};

// Generate HTML dashboard
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Framework Validation Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    h1, h2 {
      color: #333;
    }
    .dashboard {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      flex: 1;
      min-width: 250px;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .card h3 {
      margin-top: 0;
    }
    .passed { background-color: #d4edda; color: #155724; }
    .warning { background-color: #fff3cd; color: #856404; }
    .failed { background-color: #f8d7da; color: #721c24; }
    .skipped { background-color: #e2e3e5; color: #383d41; }
    .metric {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }
    pre {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      overflow: auto;
      max-height: 400px;
    }
    .timestamp {
      color: #6c757d;
      font-size: 14px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Framework Validation Dashboard</h1>
    <p>This dashboard shows the current health status of the Playwright framework.</p>
    
    <h2>Health Check Summary</h2>
    <div class="dashboard">
      <div class="card passed">
        <h3>Passed Checks</h3>
        <div class="metric">${passed}</div>
      </div>
      <div class="card warning">
        <h3>Warnings</h3>
        <div class="metric">${warnings}</div>
      </div>
      <div class="card failed">
        <h3>Failed Checks</h3>
        <div class="metric">${failed}</div>
      </div>
    </div>
    
    <h2>Validation Tests Summary</h2>
    <div class="dashboard">
      <div class="card passed">
        <h3>Passed Tests</h3>
        <div class="metric">${testPassed}</div>
      </div>
      <div class="card failed">
        <h3>Failed Tests</h3>
        <div class="metric">${testFailed}</div>
      </div>
      <div class="card skipped">
        <h3>Skipped Tests</h3>
        <div class="metric">${testSkipped}</div>
      </div>
    </div>
    
    <h2>Component Versions</h2>
    <div class="dashboard">
      <div class="card">
        <h3>Node.js</h3>
        <div class="metric">${versions.node}</div>
      </div>
      <div class="card">
        <h3>npm</h3>
        <div class="metric">${versions.npm}</div>
      </div>
      <div class="card">
        <h3>Playwright</h3>
        <div class="metric">${versions.playwright}</div>
      </div>
      <div class="card">
        <h3>Framework</h3>
        <div class="metric">${versions.framework}</div>
      </div>
    </div>

    <h2>Test Coverage</h2>
    <div class="dashboard">
      <div class="card">
        <h3>Statements</h3>
        <div class="metric">${coverageData.statements}</div>
      </div>
      <div class="card">
        <h3>Branches</h3>
        <div class="metric">${coverageData.branches}</div>
      </div>
      <div class="card">
        <h3>Functions</h3>
        <div class="metric">${coverageData.functions}</div>
      </div>
      <div class="card">
        <h3>Lines</h3>
        <div class="metric">${coverageData.lines}</div>
      </div>
    </div>
    
    <h2>Health Check Output</h2>
    <pre>${healthCheckOutput}</pre>
    
    <h2>Validation Tests Output</h2>
    <pre>${validationTestOutput}</pre>
    
    <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
`;

// Create reports directory if it doesn't exist
const reportsDir = path.resolve(__dirname, '../reports/validation');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Write dashboard to file
const dashboardPath = path.join(reportsDir, 'dashboard.html');
fs.writeFileSync(dashboardPath, html);

console.log(`Validation dashboard generated at: ${dashboardPath}`);

// Exit with appropriate code
if (failed > 0 || testFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
