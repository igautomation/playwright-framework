// src/utils/git/gitUtils.js

/**
 * Git Utilities for Playwright Automation Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Wrap common Git operations programmatically
 * - Support cloning, branching, committing, pulling, and pushing
 * - Abstract Git commands behind safe error handling
 */

import { execSync } from 'child_process';

class GitUtils {
  constructor() {}

  /**
   * Clones a Git repository.
   * @param {string} repoUrl - Repository URL.
   * @param {string} [destPath] - Destination path (optional).
   */
  clone(repoUrl, destPath) {
    if (!repoUrl) {
      throw new Error('Repository URL is required');
    }
    try {
      const cmd = destPath
        ? `git clone ${repoUrl} ${destPath}`
        : `git clone ${repoUrl}`;
      execSync(cmd, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  /**
   * Checks out a Git branch.
   * @param {string} branch - Branch name.
   * @param {string} [repoPath] - Path to the repository.
   */
  checkout(branch, repoPath) {
    if (!branch) {
      throw new Error('Branch name is required');
    }
    try {
      const cmd = `git checkout ${branch}`;
      execSync(cmd, { stdio: 'inherit', cwd: repoPath || process.cwd() });
    } catch (error) {
      throw new Error(`Failed to checkout branch ${branch}: ${error.message}`);
    }
  }

  /**
   * Gets the current Git status.
   * @param {string} [repoPath] - Path to the repository.
   * @returns {string} - Git status output.
   */
  status(repoPath) {
    try {
      return execSync('git status', {
        encoding: 'utf8',
        cwd: repoPath || process.cwd(),
      });
    } catch (error) {
      throw new Error(`Failed to get Git status: ${error.message}`);
    }
  }

  /**
   * Pulls updates from the remote Git repository.
   * @param {string} [branch] - Specific branch to pull.
   * @param {string} [repoPath] - Path to the repository.
   */
  pull(branch, repoPath) {
    try {
      const cmd = branch ? `git pull origin ${branch}` : 'git pull';
      execSync(cmd, { stdio: 'inherit', cwd: repoPath || process.cwd() });
    } catch (error) {
      throw new Error(`Failed to pull from Git: ${error.message}`);
    }
  }

  /**
   * Commits changes to the Git repository.
   * @param {string} message - Commit message.
   * @param {string} [repoPath] - Path to the repository.
   */
  commit(message, repoPath) {
    if (!message) {
      throw new Error('Commit message is required');
    }
    try {
      execSync('git add .', { stdio: 'inherit', cwd: repoPath || process.cwd() });
      execSync(`git commit -m "${message}"`, {
        stdio: 'inherit',
        cwd: repoPath || process.cwd(),
      });
    } catch (error) {
      throw new Error(`Failed to commit changes: ${error.message}`);
    }
  }

  /**
   * Pushes committed changes to the remote Git repository.
   * @param {string} branch - Branch to push to.
   * @param {string} [repoPath] - Path to the repository.
   */
  push(branch, repoPath) {
    if (!branch) {
      throw new Error('Branch name is required');
    }
    try {
      execSync(`git push origin ${branch}`, {
        stdio: 'inherit',
        cwd: repoPath || process.cwd(),
      });
    } catch (error) {
      throw new Error(`Failed to push to GitHub: ${error.message}`);
    }
  }
}

export default GitUtils;