/**
 * CI Utilities for Playwright Framework
 * 
 * Provides integration with CI/CD systems like GitHub Actions, Jenkins, etc.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * CI Utilities class
 */
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
   * Pushes committed changes to a GitHub repository
   * @param {string} branch - Branch to push to (e.g., 'main')
   * @param {string} [commitMessage='Automated CI push'] - Commit message to use
   * @param {string} [repoPath] - Optional path to the repository (default: current working directory)
   */
  pushToGitHub(branch, commitMessage = 'Automated CI push', repoPath) {
    if (!branch) {
      throw new Error('Branch is required');
    }
    try {
      const cwd = repoPath || this.options.repoRoot;
      
      // Add all changes
      execSync('git add .', { cwd });
      
      // Commit changes
      execSync(`git commit -m "${commitMessage}"`, { cwd });
      
      // Push to remote
      execSync(`git push origin ${branch}`, { cwd });
      
      console.log(`Successfully pushed to GitHub branch: ${branch}`);
      return true;
    } catch (error) {
      console.error(`Failed to push to GitHub: ${error.message}`);
      throw error;
    }
  }

  /**
   * Configures a Jenkins pipeline by optionally writing a Jenkinsfile
   * @param {Object} config - Jenkins configuration details
   * @param {string} config.jobName - Jenkins job name
   * @param {string} [config.pipelineScript] - Optional pipeline script content
   * @param {string} [config.jenkinsfilePath] - Path to write Jenkinsfile (default: Jenkinsfile in repo root)
   */
  configureJenkinsPipeline(config) {
    if (!config || !config.jobName) {
      throw new Error('Jenkins job name is required');
    }
    try {
      console.log(`Configuring Jenkins pipeline for job: ${config.jobName}`);
      
      if (config.pipelineScript) {
        const jenkinsfilePath = config.jenkinsfilePath || path.join(this.options.repoRoot, 'Jenkinsfile');
        console.log(`Writing Jenkinsfile to: ${jenkinsfilePath}`);
        fs.writeFileSync(jenkinsfilePath, config.pipelineScript);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to configure Jenkins pipeline: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sets up a CI environment by cloning a repository and installing dependencies
   * @param {Object} config - CI environment setup details
   * @param {string} config.repoUrl - Repository URL to clone
   * @param {string} [config.branch='main'] - Branch to checkout
   * @param {string} [config.repoPath] - Directory where repo should be cloned (default: derived from repo name)
   * @param {boolean} [config.installDeps=true] - Whether to install dependencies
   */
  setupCiEnvironment(config) {
    if (!config || !config.repoUrl) {
      throw new Error('Repository URL is required');
    }
    try {
      const repoPath = config.repoPath || path.join(this.options.repoRoot, config.repoUrl.split('/').pop().replace('.git', ''));
      const branch = config.branch || 'main';
      const installDeps = config.installDeps !== false;

      console.log(`Setting up CI environment for repo: ${config.repoUrl}`);
      
      // Clone repository
      execSync(`git clone ${config.repoUrl} ${repoPath}`);
      
      // Checkout branch
      execSync(`git checkout ${branch}`, { cwd: repoPath });

      // Install dependencies if requested
      if (installDeps) {
        console.log('Installing dependencies...');
        execSync('npm install', { cwd: repoPath, stdio: 'inherit' });
      }
      
      console.log(`CI environment set up at: ${repoPath}`);
      return repoPath;
    } catch (error) {
      console.error(`Failed to set up CI environment: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generates a GitHub Actions workflow file
   * @param {Object} config - Workflow configuration
   * @param {string} config.name - Workflow name
   * @param {Array<string>} config.triggers - Workflow triggers (e.g., ['push', 'pull_request'])
   * @param {Array<Object>} config.jobs - Workflow jobs
   * @param {string} [config.outputPath] - Path to write workflow file (default: .github/workflows/{name}.yml)
   * @returns {string} Path to the generated workflow file
   */
  generateGitHubWorkflow(config) {
    if (!config || !config.name || !config.jobs) {
      throw new Error('Workflow name and jobs are required');
    }
    
    try {
      // Generate workflow YAML
      let yaml = `name: ${config.name}\n\n`;
      
      // Add triggers
      if (config.triggers && config.triggers.length > 0) {
        yaml += 'on:\n';
        config.triggers.forEach(trigger => {
          yaml += `  ${trigger}:\n`;
        });
      } else {
        yaml += 'on: [push, pull_request]\n';
      }
      
      yaml += '\njobs:\n';
      
      // Add jobs
      config.jobs.forEach(job => {
        yaml += `  ${job.id}:\n`;
        yaml += `    name: ${job.name || job.id}\n`;
        yaml += `    runs-on: ${job.runsOn || 'ubuntu-latest'}\n`;
        
        // Add steps
        if (job.steps && job.steps.length > 0) {
          yaml += '    steps:\n';
          job.steps.forEach(step => {
            yaml += `      - name: ${step.name}\n`;
            if (step.uses) {
              yaml += `        uses: ${step.uses}\n`;
            }
            if (step.run) {
              yaml += `        run: ${step.run}\n`;
            }
            if (step.with) {
              yaml += '        with:\n';
              Object.entries(step.with).forEach(([key, value]) => {
                yaml += `          ${key}: ${value}\n`;
              });
            }
          });
        }
      });
      
      // Write workflow file
      const outputPath = config.outputPath || path.join(this.options.repoRoot, '.github', 'workflows', `${config.name.toLowerCase().replace(/\s+/g, '-')}.yml`);
      
      // Create directory if it doesn't exist
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, yaml);
      console.log(`GitHub Actions workflow generated at: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      console.error(`Failed to generate GitHub workflow: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generates a Playwright GitHub Actions workflow file
   * @param {Object} config - Configuration options
   * @param {string} [config.name='Playwright Tests'] - Workflow name
   * @param {Array<string>} [config.browsers=['chromium', 'firefox', 'webkit']] - Browsers to test
   * @param {string} [config.outputPath] - Path to write workflow file
   * @returns {string} Path to the generated workflow file
   */
  generatePlaywrightWorkflow(config = {}) {
    const name = config.name || 'Playwright Tests';
    const browsers = config.browsers || ['chromium', 'firefox', 'webkit'];
    
    const workflow = {
      name,
      triggers: ['push', 'pull_request'],
      jobs: [
        {
          id: 'test',
          name: 'Run Playwright Tests',
          runsOn: 'ubuntu-latest',
          steps: [
            {
              name: 'Checkout repository',
              uses: 'actions/checkout@v3'
            },
            {
              name: 'Setup Node.js',
              uses: 'actions/setup-node@v3',
              with: {
                'node-version': '18'
              }
            },
            {
              name: 'Install dependencies',
              run: 'npm ci'
            },
            {
              name: 'Install Playwright browsers',
              run: 'npx playwright install --with-deps'
            },
            {
              name: 'Run Playwright tests',
              run: `npx playwright test --project=${browsers.join(' --project=')}`
            },
            {
              name: 'Upload test results',
              uses: 'actions/upload-artifact@v3',
              with: {
                'name': 'playwright-report',
                'path': 'playwright-report/',
                'retention-days': '30'
              }
            }
          ]
        }
      ],
      outputPath: config.outputPath
    };
    
    return this.generateGitHubWorkflow(workflow);
  }
  
  /**
   * Detects the current CI environment
   * @returns {Object} CI environment details
   */
  detectCiEnvironment() {
    const env = {
      isCI: false,
      provider: null,
      details: {}
    };
    
    // Check if running in a CI environment
    if (process.env.CI === 'true' || process.env.CI === true) {
      env.isCI = true;
      
      // GitHub Actions
      if (process.env.GITHUB_ACTIONS === 'true') {
        env.provider = 'github';
        env.details = {
          event: process.env.GITHUB_EVENT_NAME,
          repository: process.env.GITHUB_REPOSITORY,
          ref: process.env.GITHUB_REF,
          sha: process.env.GITHUB_SHA,
          workflow: process.env.GITHUB_WORKFLOW,
          actor: process.env.GITHUB_ACTOR
        };
      }
      // Jenkins
      else if (process.env.JENKINS_URL) {
        env.provider = 'jenkins';
        env.details = {
          jobName: process.env.JOB_NAME,
          buildNumber: process.env.BUILD_NUMBER,
          buildUrl: process.env.BUILD_URL
        };
      }
      // CircleCI
      else if (process.env.CIRCLECI === 'true') {
        env.provider = 'circleci';
        env.details = {
          buildNum: process.env.CIRCLE_BUILD_NUM,
          job: process.env.CIRCLE_JOB,
          branch: process.env.CIRCLE_BRANCH,
          sha: process.env.CIRCLE_SHA1
        };
      }
      // Travis CI
      else if (process.env.TRAVIS === 'true') {
        env.provider = 'travis';
        env.details = {
          buildId: process.env.TRAVIS_BUILD_ID,
          jobId: process.env.TRAVIS_JOB_ID,
          branch: process.env.TRAVIS_BRANCH,
          commit: process.env.TRAVIS_COMMIT
        };
      }
      // GitLab CI
      else if (process.env.GITLAB_CI === 'true') {
        env.provider = 'gitlab';
        env.details = {
          jobName: process.env.CI_JOB_NAME,
          pipeline: process.env.CI_PIPELINE_ID,
          project: process.env.CI_PROJECT_PATH,
          commit: process.env.CI_COMMIT_SHA
        };
      }
      // Azure Pipelines
      else if (process.env.TF_BUILD === 'True') {
        env.provider = 'azure';
        env.details = {
          buildId: process.env.BUILD_BUILDID,
          buildNumber: process.env.BUILD_BUILDNUMBER,
          definitionName: process.env.BUILD_DEFINITIONNAME
        };
      }
      // Generic CI
      else {
        env.provider = 'unknown';
      }
    }
    
    return env;
  }
}

module.exports = CIUtils;