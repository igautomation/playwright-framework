// src/utils/git/gitUtils.js
const { execSync } = require('child_process');

/**
 * Git utilities for Playwright test automation
 */
function GitUtils() {}

/**
 * Clones a Git repository
 * @param {string} repoUrl - Repository URL (e.g., 'https://github.com/user/repo.git')
 * @param {string} [destPath] - Destination path (default: repo name)
 * @returns {void}
 * @throws {Error} If clone fails
 */
GitUtils.prototype.clone = function (repoUrl, destPath) {
  if (!repoUrl) throw new Error('Repository URL is required');
  try {
    const cmd = destPath ? `git clone ${repoUrl} ${destPath}` : `git clone ${repoUrl}`;
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
};

/**
 * Checks out a Git branch
 * @param {string} branch - Branch name (e.g., 'main')
 * @param {string} [repoPath] - Path to repository (default: current directory)
 * @returns {void}
 * @throws {Error} If checkout fails
 */
GitUtils.prototype.checkout = function (branch, repoPath) {
  if (!branch) throw new Error('Branch name is required');
  try {
    const cmd = `git checkout ${branch}`;
    execSync(cmd, { stdio: 'inherit', cwd: repoPath || process.cwd() });
  } catch (error) {
    throw new Error(`Failed to checkout branch ${branch}: ${error.message}`);
  }
};

/**
 * Gets the current Git status
 * @param {string} [repoPath] - Path to repository (default: current directory)
 * @returns {string} Git status output
 * @throws {Error} If status check fails
 */
GitUtils.prototype.status = function (repoPath) {
  try {
    return execSync('git status', { encoding: 'utf8', cwd: repoPath || process.cwd() });
  } catch (error) {
    throw new Error(`Failed to get Git status: ${error.message}`);
  }
};

/**
 * Pulls updates from a Git repository
 * @param {string} [branch] - Branch to pull (default: current branch)
 * @param {string} [repoPath] - Path to repository (default: current directory)
 * @returns {void}
 * @throws {Error} If pull fails
 */
GitUtils.prototype.pull = function (branch, repoPath) {
  try {
    const cmd = branch ? `git pull origin ${branch}` : 'git pull';
    execSync(cmd, { stdio: 'inherit', cwd: repoPath || process.cwd() });
  } catch (error) {
    throw new Error(`Failed to pull from Git: ${error.message}`);
  }
};

/**
 * Commits changes to the Git repository
 * @param {string} message - Commit message
 * @param {string} [repoPath] - Path to repository (default: current directory)
 * @returns {void}
 * @throws {Error} If commit fails
 */
GitUtils.prototype.commit = function (message, repoPath) {
  if (!message) throw new Error('Commit message is required');
  try {
    execSync('git add .', { stdio: 'inherit', cwd: repoPath || process.cwd() });
    execSync(`git commit -m "${message}"`, { stdio: 'inherit', cwd: repoPath || process.cwd() });
  } catch (error) {
    throw new Error(`Failed to commit changes: ${error.message}`);
  }
};

/**
 * Pushes changes to a GitHub repository
 * @param {string} branch - Branch to push to (e.g., 'main')
 * @param {string} [repoPath] - Path to repository (default: current directory)
 * @returns {void}
 * @throws {Error} If push fails
 */
GitUtils.prototype.push = function (branch, repoPath) {
  if (!branch) throw new Error('Branch name is required');
  try {
    execSync(`git push origin ${branch}`, { stdio: 'inherit', cwd: repoPath || process.cwd() });
  } catch (error) {
    throw new Error(`Failed to push to GitHub: ${error.message}`);
  }
};

module.exports = GitUtils;