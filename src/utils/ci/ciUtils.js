// src/utils/ci/ciUtils.js

/**
 * CI Utilities for Playwright Framework.
 *
 * Responsibilities:
 * - GitHub operations (commit, push)
 * - Jenkins pipeline setup
 * - CI environment bootstrap (clone repository, install dependencies)
 */

const GitUtils = require("../git/gitUtils");
const { execSync } = require("child_process");

/**
 * Constructor for CI utilities.
 */
function CIUtils() {
  this.git = new GitUtils();
}

/**
 * Pushes committed changes to a GitHub repository.
 *
 * @param {string} branch - Branch to push to (e.g., 'main').
 * @param {string} [commitMessage='Automated CI push'] - Commit message to use.
 * @param {string} [repoPath] - Optional path to the repository (default: current working directory).
 * @throws {Error} If the push operation fails.
 */
CIUtils.prototype.pushToGitHub = function (
  branch,
  commitMessage = "Automated CI push",
  repoPath
) {
  if (!branch) {
    throw new Error("Branch is required");
  }
  try {
    this.git.commit(commitMessage, repoPath);
    this.git.push(branch, repoPath);
  } catch (error) {
    throw new Error(`Failed to push to GitHub: ${error.message}`);
  }
};

/**
 * Configures a Jenkins pipeline by optionally writing a Jenkinsfile.
 *
 * @param {Object} config - Jenkins configuration details.
 * @param {string} config.jobName - Jenkins job name.
 * @param {string} [config.pipelineScript] - Optional pipeline script content.
 * @throws {Error} If configuration or file creation fails.
 */
CIUtils.prototype.configureJenkinsPipeline = function (config) {
  if (!config || !config.jobName) {
    throw new Error("Jenkins job name is required");
  }
  try {
    console.log(`Configuring Jenkins pipeline for job: ${config.jobName}`);
    if (config.pipelineScript) {
      console.log("Writing Jenkinsfile with provided pipeline script.");
      require("fs").writeFileSync("Jenkinsfile", config.pipelineScript);
    }
  } catch (error) {
    throw new Error(`Failed to configure Jenkins pipeline: ${error.message}`);
  }
};

/**
 * Sets up a CI environment by cloning a repository and installing dependencies.
 *
 * @param {Object} config - CI environment setup details.
 * @param {string} config.repoUrl - Repository URL to clone.
 * @param {string} [config.branch='main'] - Branch to checkout.
 * @param {string} [config.repoPath] - Directory where repo should be cloned (default: derived from repo name).
 * @throws {Error} If the cloning or installation fails.
 */
CIUtils.prototype.setupCiEnvironment = function (config) {
  if (!config || !config.repoUrl) {
    throw new Error("Repository URL is required");
  }
  try {
    const repoPath =
      config.repoPath || config.repoUrl.split("/").pop().replace(".git", "");
    const branch = config.branch || "main";

    // Clone the repository and checkout the desired branch
    this.git.clone(config.repoUrl, repoPath);
    this.git.checkout(branch, repoPath);

    // Install project dependencies
    execSync("npm install", { cwd: repoPath, stdio: "inherit" });
    console.log(`CI environment set up at: ${repoPath}`);
  } catch (error) {
    throw new Error(`Failed to set up CI environment: ${error.message}`);
  }
};

module.exports = CIUtils;
