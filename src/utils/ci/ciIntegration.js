/**
 * CI Integration Utilities for Playwright Framework
 * 
 * Provides integration with CI/CD systems like GitHub Actions, Jenkins, etc.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../common/logger');

class CIIntegration {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      ciSystem: this._detectCISystem(),
      repoRoot: process.cwd(),
      ...options
    };
  }

  /**
   * Detect CI system
   * @returns {string} CI system name
   * @private
   */
  _detectCISystem() {
    if (process.env.GITHUB_ACTIONS) return 'github';
    if (process.env.JENKINS_URL) return 'jenkins';
    if (process.env.GITLAB_CI) return 'gitlab';
    if (process.env.TRAVIS) return 'travis';
    if (process.env.CIRCLECI) return 'circle';
    if (process.env.BITBUCKET_BUILD_NUMBER) return 'bitbucket';
    if (process.env.AZURE_DEVOPS_BUILD_ID) return 'azure';
    return 'unknown';
  }

  /**
   * Get CI system information
   * @returns {Object} CI system info
   */
  getCIInfo() {
    const info = {
      system: this.options.ciSystem,
      detected: this.options.ciSystem !== 'unknown',
      env: {}
    };

    switch (this.options.ciSystem) {
      case 'github':
        info.env = {
          repo: process.env.GITHUB_REPOSITORY,
          workflow: process.env.GITHUB_WORKFLOW,
          runId: process.env.GITHUB_RUN_ID,
          runNumber: process.env.GITHUB_RUN_NUMBER,
          actor: process.env.GITHUB_ACTOR,
          ref: process.env.GITHUB_REF,
          sha: process.env.GITHUB_SHA
        };
        break;
      case 'jenkins':
        info.env = {
          jobName: process.env.JOB_NAME,
          buildNumber: process.env.BUILD_NUMBER,
          buildUrl: process.env.BUILD_URL,
          gitCommit: process.env.GIT_COMMIT,
          gitBranch: process.env.GIT_BRANCH
        };
        break;
      case 'gitlab':
        info.env = {
          projectId: process.env.CI_PROJECT_ID,
          pipelineId: process.env.CI_PIPELINE_ID,
          jobId: process.env.CI_JOB_ID,
          commitSha: process.env.CI_COMMIT_SHA,
          commitRef: process.env.CI_COMMIT_REF_NAME
        };
        break;
      // Add other CI systems as needed
    }

    return info;
  }

  /**
   * Generate GitHub Actions workflow file
   * @param {Object} options - Workflow options
   * @returns {string} Path to generated workflow file
   */
  generateGitHubWorkflow(options = {}) {
    const opts = {
      name: options.name || 'Playwright Tests',
      branches: options.branches || ['main', 'master'],
      nodeVersion: options.nodeVersion || '18',
      testCommand: options.testCommand || 'npm test',
      reportCommand: options.reportCommand || 'npm run report',
      artifactName: options.artifactName || 'test-results',
      artifactPath: options.artifactPath || 'reports',
      ...options
    };

    logger.info(`Generating GitHub Actions workflow: ${opts.name}`);

    // Create workflow directory if it doesn't exist
    const workflowDir = path.join(this.options.repoRoot, '.github/workflows');
    if (!fs.existsSync(workflowDir)) {
      fs.mkdirSync(workflowDir, { recursive: true });
    }

    // Generate workflow file name
    const workflowFileName = opts.name.toLowerCase().replace(/\s+/g, '-') + '.yml';
    const workflowPath = path.join(workflowDir, workflowFileName);

    // Generate workflow content
    const workflowContent = `name: ${opts.name}

on:
  push:
    branches: [${opts.branches.map(b => `'${b}'`).join(', ')}]
  pull_request:
    branches: [${opts.branches.map(b => `'${b}'`).join(', ')}]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '${opts.nodeVersion}'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run Playwright tests
        run: ${opts.testCommand}
        
      - name: Generate test reports
        if: always()
        run: ${opts.reportCommand}
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: ${opts.artifactName}
          path: ${opts.artifactPath}
          retention-days: 30
`;

    // Write workflow file
    fs.writeFileSync(workflowPath, workflowContent);
    logger.info(`GitHub Actions workflow generated at: ${workflowPath}`);

    return workflowPath;
  }

  /**
   * Generate Jenkins pipeline file
   * @param {Object} options - Pipeline options
   * @returns {string} Path to generated Jenkinsfile
   */
  generateJenkinsPipeline(options = {}) {
    const opts = {
      nodeVersion: options.nodeVersion || '18',
      testCommand: options.testCommand || 'npm test',
      reportCommand: options.reportCommand || 'npm run report',
      ...options
    };

    logger.info('Generating Jenkins pipeline');

    // Generate Jenkinsfile content
    const jenkinsfileContent = `pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.35.0-focal'
        }
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Test') {
            steps {
                sh '${opts.testCommand}'
            }
        }
        
        stage('Report') {
            steps {
                sh '${opts.reportCommand}'
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports/html',
                reportFiles: 'index.html',
                reportName: 'Test Report'
            ])
        }
    }
}`;

    // Write Jenkinsfile
    const jenkinsfilePath = path.join(this.options.repoRoot, 'Jenkinsfile');
    fs.writeFileSync(jenkinsfilePath, jenkinsfileContent);
    logger.info(`Jenkins pipeline generated at: ${jenkinsfilePath}`);

    return jenkinsfilePath;
  }

  /**
   * Generate GitLab CI configuration
   * @param {Object} options - CI options
   * @returns {string} Path to generated .gitlab-ci.yml
   */
  generateGitLabCI(options = {}) {
    const opts = {
      nodeVersion: options.nodeVersion || '18',
      testCommand: options.testCommand || 'npm test',
      reportCommand: options.reportCommand || 'npm run report',
      ...options
    };

    logger.info('Generating GitLab CI configuration');

    // Generate .gitlab-ci.yml content
    const gitlabCIContent = `image: mcr.microsoft.com/playwright:v1.35.0-focal

stages:
  - test

variables:
  npm_config_cache: "$CI_PROJECT_DIR/.npm"

cache:
  key: ${opts.nodeVersion}
  paths:
    - .npm/

test:
  stage: test
  script:
    - npm ci
    - ${opts.testCommand}
    - ${opts.reportCommand}
  artifacts:
    paths:
      - reports/
    expire_in: 1 week
`;

    // Write .gitlab-ci.yml
    const gitlabCIPath = path.join(this.options.repoRoot, '.gitlab-ci.yml');
    fs.writeFileSync(gitlabCIPath, gitlabCIContent);
    logger.info(`GitLab CI configuration generated at: ${gitlabCIPath}`);

    return gitlabCIPath;
  }

  /**
   * Set up CI integration
   * @param {string} ciSystem - CI system to set up
   * @param {Object} options - Setup options
   * @returns {Object} Setup result
   */
  setupCIIntegration(ciSystem, options = {}) {
    logger.info(`Setting up CI integration for ${ciSystem}`);

    try {
      switch (ciSystem.toLowerCase()) {
        case 'github':
          return {
            path: this.generateGitHubWorkflow(options),
            system: 'github'
          };
        case 'jenkins':
          return {
            path: this.generateJenkinsPipeline(options),
            system: 'jenkins'
          };
        case 'gitlab':
          return {
            path: this.generateGitLabCI(options),
            system: 'gitlab'
          };
        default:
          throw new Error(`Unsupported CI system: ${ciSystem}`);
      }
    } catch (error) {
      logger.error(`Error setting up CI integration: ${error.message}`);
      throw error;
    }
  }

  /**
   * Post test results to CI system
   * @param {Object} results - Test results
   * @returns {Promise<Object>} Post result
   */
  async postResultsToCI(results) {
    logger.info(`Posting test results to ${this.options.ciSystem}`);

    try {
      switch (this.options.ciSystem) {
        case 'github':
          return this._postToGitHub(results);
        case 'jenkins':
          return this._postToJenkins(results);
        case 'gitlab':
          return this._postToGitLab(results);
        default:
          logger.warn(`Posting results to ${this.options.ciSystem} is not supported`);
          return { success: false, message: 'Unsupported CI system' };
      }
    } catch (error) {
      logger.error(`Error posting test results: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Post test results to GitHub
   * @param {Object} results - Test results
   * @returns {Promise<Object>} Post result
   * @private
   */
  async _postToGitHub(results) {
    // This would use GitHub API to post results
    // For now, just log that it would be posted
    logger.info('Would post results to GitHub');
    return { success: true, message: 'Results would be posted to GitHub' };
  }

  /**
   * Post test results to Jenkins
   * @param {Object} results - Test results
   * @returns {Promise<Object>} Post result
   * @private
   */
  async _postToJenkins(results) {
    // This would use Jenkins API to post results
    // For now, just log that it would be posted
    logger.info('Would post results to Jenkins');
    return { success: true, message: 'Results would be posted to Jenkins' };
  }

  /**
   * Post test results to GitLab
   * @param {Object} results - Test results
   * @returns {Promise<Object>} Post result
   * @private
   */
  async _postToGitLab(results) {
    // This would use GitLab API to post results
    // For now, just log that it would be posted
    logger.info('Would post results to GitLab');
    return { success: true, message: 'Results would be posted to GitLab' };
  }
}

module.exports = CIIntegration;