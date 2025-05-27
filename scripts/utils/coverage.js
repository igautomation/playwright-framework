#!/usr/bin/env node
/**
 * Run test coverage analysis for the entire project
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define thresholds
const THRESHOLDS = {
  lines: 70,
  functions: 70,
  branches: 40
};

// Define output directory
const OUTPUT_DIR = path.resolve(process.cwd(), 'coverage');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  console.log('Running test coverage analysis...');
  console.log(`Thresholds - Lines: ${THRESHOLDS.lines}%, Functions: ${THRESHOLDS.functions}%, Branches: ${THRESHOLDS.branches}%`);
  
  // Run tests with coverage using c8
  execSync(
    `npx c8 --reporter=html --reporter=json-summary --reporter=text ` +
    `--check-coverage --lines ${THRESHOLDS.lines} --functions ${THRESHOLDS.functions} --branches ${THRESHOLDS.branches} ` +
    `--report-dir=${OUTPUT_DIR} ` +
    `npx playwright test`,
    { stdio: 'inherit' }
  );
  
  console.log(`\nDetailed report: ${path.join(OUTPUT_DIR, 'index.html')}`);
  
} catch (error) {
  if (error.status === 1) {
    console.error('\nCoverage thresholds not met!');
    process.exit(1);
  } else {
    console.error('Coverage analysis failed:', error.message);
    process.exit(1);
  }
}