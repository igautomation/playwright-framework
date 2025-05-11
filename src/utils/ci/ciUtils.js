/**
 * CI Utilities for Playwright Framework
 * 
 * Provides integration with CI/CD systems like GitHub Actions, Jenkins, etc.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../common/logger');

class CIUtils {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      repoRoot: process.cwd(),
      ...options
    };
  }

  /**
   * Pushes committed changes to a GitHub repository.
   *
   * @param {string} branch - Branch to push to (e.g., 'main')
   * @param {string} [commitMessage='Automated CI push'] - Commit message to use
   * @param {string} [repoPath] - Optional path to the repository (default: current working directory)
   */
  pushToGitHub(branch, commitMessage = 'Automated CI push', repoPath) {
    if (!branch) {
      throw new Error('Branch is required');
    }
    try {
      // Add all changes
      execSync('git add .', { cwd: repoPath || this.options.repoRoot });
      
      // Commit changes
      execSync(`git commit -m "${commitMessage}"`, { cwd: repoPath || this.options.repoRoot });
      
      // Push to remote
      execSync(`git push origin ${branch}`, { cwd: repoPath || this.options.repoRoot });
      
      logger.info(`Successfully pushed to GitHub branch: ${branch}`);
    } catch (error) {
      throw new Error(`Failed to push to GitHub: ${error.message}`);
    }
  }

  /**
   * Configures a Jenkins pipeline by optionally writing a Jenkinsfile.
   *
   * @param {Object} config - Jenkins configuration details
   * @param {string} config.jobName - Jenkins job name
   * @param {string} [config.pipelineScript] - Optional pipeline script content
   */
  configureJenkinsPipeline(config) {
    if (!config || !config.jobName) {
      throw new Error('Jenkins job name is required');
    }
    try {
      logger.info(`Configuring Jenkins pipeline for job: ${config.jobName}`);
      if (config.pipelineScript) {
        logger.info('Writing Jenkinsfile with provided pipeline script.');
        fs.writeFileSync('Jenkinsfile', config.pipelineScript);
      }
    } catch (error) {
      throw new Error(`Failed to configure Jenkins pipeline: ${error.message}`);
    }
  }

  /**
   * Sets up a CI environment by cloning a repository and installing dependencies.
   *
   * @param {Object} config - CI environment setup details
   * @param {string} config.repoUrl - Repository URL to clone
   * @param {string} [config.branch='main'] - Branch to checkout
   * @param {string} [config.repoPath] - Directory where repo should be cloned (default: derived from repo name)
   */
  setupCiEnvironment(config) {
    if (!config || !config.repoUrl) {
      throw new Error('Repository URL is required');
    }
    try {
      const repoPath = config.repoPath || config.repoUrl.split('/').pop().replace('.git', '');
      const branch = config.branch || 'main';

      // Clone repository
      execSync(`git clone ${config.repoUrl} ${repoPath}`);
      
      // Checkout branch
      execSync(`git checkout ${branch}`, { cwd: repoPath });

      // Install dependencies
      execSync('npm install', { cwd: repoPath, stdio: 'inherit' });
      logger.info(`CI environment set up at: ${repoPath}`);
    } catch (error) {
      throw new Error(`Failed to set up CI environment: ${error.message}`);
    }
  }
}

module.exports = CIUtils;