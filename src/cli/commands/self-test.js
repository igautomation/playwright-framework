const { execSync } = require('child_process');
const logger = require('../../utils/common/logger');

/**
 * Run framework self-test
 * @param {Object} options - Command options
 */
module.exports = (options) => {
  try {
    logger.info('Running framework self-test...');

    // Run health check
    logger.info('Running health check...');
    execSync('node scripts/framework-health-check.js', { stdio: 'inherit' });

    // Run validation tests
    logger.info('Running validation tests...');
    execSync('npx playwright test --grep @validation', { stdio: 'inherit' });

    // Generate validation dashboard
    logger.info('Generating validation dashboard...');
    execSync('node scripts/generate-validation-dashboard.js', {
      stdio: 'inherit',
    });

    logger.info('Self-test completed successfully!');
  } catch (error) {
    logger.error('Self-test failed:', error);
    process.exit(1);
  }
};
