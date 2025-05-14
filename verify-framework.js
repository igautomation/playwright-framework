// verify-framework.js
const { execSync } = require('child_process');

console.log('Running verification test to confirm the test framework is working...');

try {
  // Run the verification test
  execSync('npx playwright test src/tests/verification-test.spec.js --reporter=list', { stdio: 'inherit' });
  console.log('\nVerification test completed successfully!');
  console.log('The test framework is working correctly.');
} catch (error) {
  console.error('\nVerification test failed:', error);
  process.exit(1);
}