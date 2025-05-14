// run-tests-now.js
const { execSync } = require('child_process');

console.log('Running tests...');
try {
  // Run the tests
  execSync('npm test', { stdio: 'inherit' });
  console.log('Tests completed successfully!');
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}