/**
 * Git Utilities
 * 
 * Provides utilities for Git operations
 */
const { execSync } = require('child_process');

/**
 * Git Utilities class
 */
class GitUtils {
  /**
   * Constructor
   * @param {Object} options - Options
   */
  constructor(options = {}) {
    this.options = {
      cwd: options.cwd || process.cwd(),
      ...options
    };
  }

  /**
   * Clone a Git repository
   * @param {string} repoUrl - Repository URL
   * @param {string} [destPath] - Destination path
   * @param {Object} [options] - Clone options
   * @returns {string} Command output
   */
  clone(repoUrl, destPath, options = {}) {
    if (!repoUrl) {
      throw new Error('Repository URL is required');
    }
    
    try {
      const args = [];
      
      // Add destination path if provided
      if (destPath) {
        args.push(destPath);
      }
      
      // Add depth if provided
      if (options.depth) {
        args.push(`--depth=${options.depth}`);
      }
      
      // Add branch if provided
      if (options.branch) {
        args.push(`--branch=${options.branch}`);
      }
      
      // Add single-branch flag if requested
      if (options.singleBranch) {
        args.push('--single-branch');
      }
      
      const cmd = `git clone ${repoUrl} ${args.join(' ')}`;
      return execSync(cmd, { 
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      });
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  /**
   * Check out a Git branch
   * @param {string} branch - Branch name
   * @param {Object} [options] - Checkout options
   * @returns {string} Command output
   */
  checkout(branch, options = {}) {
    if (!branch) {
      throw new Error('Branch name is required');
    }
    
    try {
      const args = [branch];
      
      // Add create branch flag if requested
      if (options.create) {
        args.unshift('-b');
      }
      
      const cmd = `git checkout ${args.join(' ')}`;
      return execSync(cmd, { 
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      });
    } catch (error) {
      throw new Error(`Failed to checkout branch ${branch}: ${error.message}`);
    }
  }

  /**
   * Get Git status
   * @param {Object} [options] - Status options
   * @returns {string} Git status output
   */
  status(options = {}) {
    try {
      const args = [];
      
      // Add short flag if requested
      if (options.short) {
        args.push('--short');
      }
      
      const cmd = `git status ${args.join(' ')}`;
      return execSync(cmd, {
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      });
    } catch (error) {
      throw new Error(`Failed to get Git status: ${error.message}`);
    }
  }

  /**
   * Pull updates from remote repository
   * @param {string} [branch] - Branch to pull
   * @param {Object} [options] - Pull options
   * @returns {string} Command output
   */
  pull(branch, options = {}) {
    try {
      const args = [];
      
      // Add remote if provided
      const remote = options.remote || 'origin';
      
      // Add branch if provided
      if (branch) {
        args.push(`${remote} ${branch}`);
      }
      
      // Add rebase flag if requested
      if (options.rebase) {
        args.push('--rebase');
      }
      
      const cmd = `git pull ${args.join(' ')}`;
      return execSync(cmd, { 
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      });
    } catch (error) {
      throw new Error(`Failed to pull from Git: ${error.message}`);
    }
  }

  /**
   * Commit changes
   * @param {string} message - Commit message
   * @param {Object} [options] - Commit options
   * @returns {string} Command output
   */
  commit(message, options = {}) {
    if (!message) {
      throw new Error('Commit message is required');
    }
    
    try {
      // Add files if not skipped
      if (!options.skipAdd) {
        execSync('git add .', {
          stdio: options.silent ? 'pipe' : 'inherit',
          cwd: options.cwd || this.options.cwd
        });
      }
      
      const args = [`-m "${message}"`];
      
      // Add amend flag if requested
      if (options.amend) {
        args.push('--amend');
      }
      
      // Add no-edit flag if amending without changing message
      if (options.amend && options.noEdit) {
        args.push('--no-edit');
      }
      
      const cmd = `git commit ${args.join(' ')}`;
      return execSync(cmd, {
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      });
    } catch (error) {
      throw new Error(`Failed to commit changes: ${error.message}`);
    }
  }

  /**
   * Push changes to remote repository
   * @param {string} branch - Branch to push
   * @param {Object} [options] - Push options
   * @returns {string} Command output
   */
  push(branch, options = {}) {
    if (!branch) {
      throw new Error('Branch name is required');
    }
    
    try {
      const args = [];
      
      // Add remote if provided
      const remote = options.remote || 'origin';
      args.push(remote, branch);
      
      // Add force flag if requested
      if (options.force) {
        args.push('--force');
      }
      
      // Add set-upstream flag if requested
      if (options.setUpstream) {
        args.push('--set-upstream');
      }
      
      const cmd = `git push ${args.join(' ')}`;
      return execSync(cmd, {
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      });
    } catch (error) {
      throw new Error(`Failed to push to remote: ${error.message}`);
    }
  }
  
  /**
   * Get current branch
   * @param {Object} [options] - Options
   * @returns {string} Current branch name
   */
  getCurrentBranch(options = {}) {
    try {
      const cmd = 'git rev-parse --abbrev-ref HEAD';
      return execSync(cmd, {
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      }).trim();
    } catch (error) {
      throw new Error(`Failed to get current branch: ${error.message}`);
    }
  }
  
  /**
   * Get list of branches
   * @param {Object} [options] - Options
   * @returns {Array<string>} List of branches
   */
  getBranches(options = {}) {
    try {
      const args = ['--format=%(refname:short)'];
      
      // Add remote flag if requested
      if (options.remote) {
        args.unshift('-r');
      }
      
      const cmd = `git branch ${args.join(' ')}`;
      const output = execSync(cmd, {
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      });
      
      return output.split('\n')
        .map(branch => branch.trim())
        .filter(branch => branch);
    } catch (error) {
      throw new Error(`Failed to get branches: ${error.message}`);
    }
  }
  
  /**
   * Get last commit hash
   * @param {Object} [options] - Options
   * @returns {string} Commit hash
   */
  getLastCommitHash(options = {}) {
    try {
      const cmd = 'git rev-parse HEAD';
      return execSync(cmd, {
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      }).trim();
    } catch (error) {
      throw new Error(`Failed to get last commit hash: ${error.message}`);
    }
  }
  
  /**
   * Get changed files
   * @param {string} [reference] - Git reference (commit, branch, etc.)
   * @param {Object} [options] - Options
   * @returns {Array<string>} List of changed files
   */
  getChangedFiles(reference = 'HEAD~1', options = {}) {
    try {
      const cmd = `git diff --name-only ${reference}`;
      const output = execSync(cmd, {
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      });
      
      return output.split('\n')
        .map(file => file.trim())
        .filter(file => file);
    } catch (error) {
      throw new Error(`Failed to get changed files: ${error.message}`);
    }
  }
  
  /**
   * Check if repository is clean (no uncommitted changes)
   * @param {Object} [options] - Options
   * @returns {boolean} True if repository is clean
   */
  isClean(options = {}) {
    try {
      const status = this.status({ ...options, short: true });
      return status.trim() === '';
    } catch (error) {
      throw new Error(`Failed to check if repository is clean: ${error.message}`);
    }
  }
  
  /**
   * Create a tag
   * @param {string} tag - Tag name
   * @param {string} [message] - Tag message
   * @param {Object} [options] - Options
   * @returns {string} Command output
   */
  createTag(tag, message, options = {}) {
    if (!tag) {
      throw new Error('Tag name is required');
    }
    
    try {
      const args = [tag];
      
      // Add message if provided
      if (message) {
        args.push('-m', `"${message}"`);
      }
      
      const cmd = `git tag ${args.join(' ')}`;
      return execSync(cmd, {
        encoding: 'utf8',
        cwd: options.cwd || this.options.cwd
      });
    } catch (error) {
      throw new Error(`Failed to create tag: ${error.message}`);
    }
  }
}

module.exports = GitUtils;