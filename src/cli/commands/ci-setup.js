/**
 * CI-setup command for the CLI
 *
 * This command sets up CI/CD integration for the project
 */
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/common/logger');
const CIIntegration = require('../../utils/ci/ciIntegration');

/**
 * Set up CI/CD integration
 * @param {Object} options - Command options
 */
module.exports = async (options = {}) => {
  try {
    logger.info('Setting up CI/CD integration...');
    
    const ciSystem = options.system || 'github';
    const ciOptions = {
      name: options.name || 'Playwright Tests',
      branches: options.branches ? options.branches.split(',') : ['main', 'master'],
      nodeVersion: options.nodeVersion || '18',
      testCommand: options.testCommand || 'npm test',
      reportCommand: options.reportCommand || 'npm run report',
      artifactName: options.artifactName || 'test-results',
      artifactPath: options.artifactPath || 'reports'
    };
    
    // Create CI integration instance
    const ciIntegration = new CIIntegration();
    
    // Set up CI integration
    const result = ciIntegration.setupCIIntegration(ciSystem, ciOptions);
    
    logger.info(`CI/CD integration set up successfully for ${ciSystem}`);
    logger.info(`Configuration file generated at: ${result.path}`);
    
    // Print next steps
    printNextSteps(ciSystem, result.path);
    
    return result;
  } catch (error) {
    logger.error('Error setting up CI/CD integration:', error.message || error);
    if (!options.ignoreErrors) {
      process.exit(1);
    }
  }
};

/**
 * Print next steps
 * @param {string} ciSystem - CI system
 * @param {string} configPath - Path to configuration file
 */
function printNextSteps(ciSystem, configPath) {
  logger.info('\n📋 Next Steps:');
  
  switch (ciSystem.toLowerCase()) {
    case 'github':
      logger.info('1. Commit the generated workflow file:');
      logger.info(`   git add ${configPath}`);
      logger.info('   git commit -m "Add GitHub Actions workflow"');
      logger.info('2. Push to GitHub:');
      logger.info('   git push origin main');
      logger.info('3. Go to your GitHub repository and check the Actions tab');
      break;
    case 'jenkins':
      logger.info('1. Commit the generated Jenkinsfile:');
      logger.info(`   git add ${configPath}`);
      logger.info('   git commit -m "Add Jenkinsfile"');
      logger.info('2. Push to your repository:');
      logger.info('   git push');
      logger.info('3. In Jenkins, create a new Pipeline job and point it to your repository');
      break;
    case 'gitlab':
      logger.info('1. Commit the generated .gitlab-ci.yml:');
      logger.info(`   git add ${configPath}`);
      logger.info('   git commit -m "Add GitLab CI configuration"');
      logger.info('2. Push to GitLab:');
      logger.info('   git push origin main');
      logger.info('3. Go to your GitLab repository and check the CI/CD section');
      break;
    default:
      logger.info(`1. Review the generated configuration file: ${configPath}`);
      logger.info('2. Commit and push the changes to your repository');
      logger.info('3. Set up the CI/CD pipeline in your CI system');
  }
}