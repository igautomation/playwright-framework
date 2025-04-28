// src/utils/ci/ciUtils.js
const GitUtils = require('../git/gitUtils');
const { execSync } = require('child_process');

/**
 * CI utilities for Playwright test automation
 */
function CIUtils() {
  this.git = new GitUtils();
}

/**
 * Pushes changes to a GitHub repository using GitUtils
 * @param {string} branch - Branch to push to (e.g., 'main')
 * @param {string} [commitMessage='Automated CI push'] - Commit message
 * @param {string} [repoPath] - Path to repository (default: current directory)
 * @returns {void}
 * @throws {Error} If push or commit fails
 */
CIUtils.prototype.pushToGitHub = function (branch, commitMessage = 'Automated CI push', repoPath) {
  if (!branch) throw new Error('Branch is required');
  try {
    this.git.commit(commitMessage, repoPath);
    this.git.push(branch, repoPath);
  } catch (error) {
    throw new Error(`Failed to push to GitHub: ${error.message}`);
  }
};

/**
 * Configures a Jenkins pipeline (placeholder for external setup)
 * @param {Object} config - Jenkins pipeline configuration
 * @param {string} config.jobName - Jenkins job name
 * @param {string} [config.pipelineScript] - Pipeline script content
 * @returns {void}
 * @throws {Error} If configuration is invalid
 */
CIUtils.prototype.configureJenkinsPipeline = function (config) {
  if (!config || !config.jobName) throw new Error('Jenkins job name is required');
  try {
    console.log(`Configuring Jenkins pipeline for job: ${config.jobName}`);
    if (config.pipelineScript) {
      console.log('Pipeline script:', config.pipelineScript);
      require('fs').writeFileSync('Jenkinsfile', config.pipelineScript);
    }
  } catch (error) {
    throw new Error(`Failed to configure Jenkins pipeline: ${error.message}`);
  }
};

/**
 * Sets up a CI environment by cloning a repository and installing dependencies
 * @param {Object} config - CI environment configuration
 * @param {string} config.repoUrl - Repository URL to clone
 * @param {string} [config.branch='main'] - Branch to checkout
 * @param {string} [config.repoPath] - Path to clone the repository
 * @returns {void}
 * @throws {Error} If setup fails
 */
CIUtils.prototype.setupCiEnvironment = function (config) {
  if (!config || !config.repoUrl) throw new Error('Repository URL is required');
  try {
    const repoPath = config.repoPath || config.repoUrl.split('/').pop().replace('.git', '');
    const branch = config.branch || 'main';

    // Clone repository and checkout branch
    this.git.clone(config.repoUrl, repoPath);
    this.git.checkout(branch, repoPath);

    // Install dependencies
    execSync('npm install', { cwd: repoPath, stdio: 'inherit' });
    console.log(`CI environment set up at ${repoPath}`);
  } catch (error) {
    throw new Error(`Failed to set up CI environment: ${error.message}`);
  }
};

module.exports = CIUtils;