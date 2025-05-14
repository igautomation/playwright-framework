// run-combined-tests.js
const { execSync } = require('child_process');

console.log('Running combined tests...');
try {
  // Run the tests in the combined directory
  execSync('npx playwright test src/tests/combined/', { stdio: 'inherit' });
  console.log('Combined tests completed successfully!');
} catch (error) {
  console.error('Error running combined tests:', error);
  process.exit(1);
}