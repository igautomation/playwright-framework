#!/usr/bin/env node
// src/cli/index.js

/**
 * Framework CLI Entry Point
 *
 * This CLI allows automation engineers to:
 * - Initialize a new project structure
 * - Run Playwright tests with flexible options
 * - Generate data (users, products) for tests
 * - Push results to Xray (test management)
 * - Manage Git operations
 * - Setup CI pipelines
 * - Manage flaky tests and retries
 * - Generate reports
 * - Enable TypeScript support
 * - Send notifications (Slack, Teams)
 *
 * Built on: Node.js, Playwright, Yargs
 */

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const { config: loadEnv } = require("dotenv-safe");

const {
  generateUsersToFile,
  generateProductsToCsv,
} = require("../utils/common/testDataFactory");
const { pushExecutionResults } = require("../utils/xray/xrayUtils");
const {
  pushToGitHub,
  configureJenkinsPipeline,
  setupCiEnvironment,
} = require("../utils/ci/ciUtils");
const {
  installPlaywrightVSCode,
  configureRetry,
} = require("../utils/setup/setupUtils");
const {
  clone,
  checkout,
  status,
  pull,
  commit,
  push,
} = require("../utils/git/gitUtils");
const {
  generateAllureReport,
  notify,
} = require("../utils/reporting/reportUtils");

const TestSelector = require("../utils/ci/testSelector");
const FlakyTestTracker = require("../utils/ci/flakyTestTracker");

const testSelector = new TestSelector();
const flakyTracker = new FlakyTestTracker();

/**
 * Loads environment variables based on NODE_ENV
 * (development, staging, production, etc.)
 */
function loadEnvironmentVariables(projectDir) {
  const env = process.env.NODE_ENV || "development";
  const envFileName = env === "development" ? "dev" : env;
  try {
    loadEnv({
      allowEmptyValues: true,
      example: path.join(projectDir, ".env.example"),
      path: path.join(projectDir, `src/config/env/${envFileName}.env`),
    });
    loadEnv({
      allowEmptyValues: true,
      example: path.join(projectDir, ".env.example"),
    });
  } catch (error) {
    console.error(`Failed to load environment variables: ${error.message}`);
    process.exit(1);
  }
  return env;
}

// ----------------------------------------
// Define CLI commands using yargs
// ----------------------------------------

yargs(hideBin(process.argv))
  /**
   * Command: init
   * Description: Scaffold a new project structure with templates and dependencies.
   */
  .command(
    "init [dir]",
    "Initialize a new Playwright automation project.",
    (yargs) => {
      return yargs.option("dir", {
        describe: "Directory name for the new project",
        type: "string",
        default: "playwright-project",
      });
    },
    require("./commands/init")
  )

  /**
   * Command: run
   * Description: Run Playwright tests with various options (tags, workers, projects, retries, etc.).
   */
  .command(
    "run [files..]",
    "Run tests with Playwright CLI",
    (yargs) => {
      return yargs
        .positional("files", {
          describe: "Test files or patterns",
          type: "string",
        })
        .option("tags", {
          describe: "Tags or titles to filter tests",
          type: "string",
        })
        .option("headed", {
          describe: "Run browser in headed mode",
          type: "boolean",
        })
        .option("project", { describe: "Run specific projects", type: "array" })
        .option("workers", {
          describe: "Set number of workers",
          type: "string",
        })
        .option("reporter", {
          describe: "Specify reporter type",
          type: "string",
        })
        .option("retries", {
          describe: "Retry failed tests N times",
          type: "number",
        });
    },
    require("./commands/run")
  )

  /**
   * Command: generate-data
   * Description: Generate sample user or product data for tests.
   */
  .command(
    "generate-data",
    "Generate test data (users/products)",
    (yargs) => {
      return yargs
        .option("type", {
          describe: "Type: users or products",
          choices: ["users", "products"],
          demandOption: true,
        })
        .option("count", {
          describe: "Number of records to generate",
          type: "number",
          default: 10,
        })
        .option("output", {
          describe: "Output file path",
          type: "string",
          demandOption: true,
        });
    },
    require("./commands/generateData")
  )

  /**
   * Command: list-tags
   * Description: Scan test files and list all available @tags.
   */
  .command(
    "list-tags",
    "List available test tags",
    {},
    require("./commands/listTags")
  )

  /**
   * Command: push-to-xray
   * Description: Push Playwright test execution results to Xray (Jira).
   */
  .command(
    "push-to-xray <testExecutionKey>",
    "Push execution results to Xray",
    (yargs) => {
      return yargs.positional("testExecutionKey", {
        describe: "Xray Test Execution key",
        type: "string",
      });
    },
    require("./commands/pushXray")
  )

  /**
   * Command: select-tests
   * Description: Select only changed tests between Git commits (for smart execution).
   */
  .command(
    "select-tests [baseCommit] [headCommit]",
    "Select tests by Git diff",
    (yargs) => {
      return yargs
        .positional("baseCommit", {
          describe: "Base Git commit",
          type: "string",
          default: "origin/main",
        })
        .positional("headCommit", {
          describe: "Head Git commit",
          type: "string",
          default: "HEAD",
        });
    },
    require("./commands/selectTests")
  )

  /**
   * Command: quarantine-flaky
   * Description: Detect and quarantine flaky tests automatically.
   */
  .command(
    "quarantine-flaky",
    "Mark flaky tests automatically",
    {},
    require("./commands/quarantineFlaky")
  )

  /**
   * Command: notify
   * Description: Send notifications to Slack/Teams after execution.
   */
  .command(
    "notify <webhookUrl> <message> [channel]",
    "Send a notification message",
    (yargs) => {
      return yargs
        .positional("webhookUrl", { describe: "Webhook URL", type: "string" })
        .positional("message", { describe: "Message to send", type: "string" })
        .positional("channel", {
          describe: "Optional channel or user",
          type: "string",
        });
    },
    require("./commands/notify")
  )

  /**
   * Command: generate-report
   * Description: Generate an Allure HTML report from Playwright results.
   */
  .command(
    "generate-report",
    "Generate Allure test report",
    {},
    require("./commands/generateReport")
  )

  /**
   * Command: git-* (clone, pull, commit, push, status)
   * Description: Git operation shortcuts.
   */
  .command(
    "git-clone <repoUrl> [destPath]",
    "Clone a Git repository",
    {},
    require("./commands/git/clone")
  )
  .command(
    "git-status [repoPath]",
    "Get Git working status",
    {},
    require("./commands/git/status")
  )
  .command(
    "git-pull [branch] [repoPath]",
    "Pull changes from Git",
    {},
    require("./commands/git/pull")
  )
  .command(
    "git-commit <message> [repoPath]",
    "Commit staged changes",
    {},
    require("./commands/git/commit")
  )
  .command(
    "git-push <branch> [repoPath]",
    "Push changes to remote branch",
    {},
    require("./commands/git/push")
  )

  /**
   * Command: setup-ci
   * Description: Setup CI environments easily with Git + Jenkins integration.
   */
  .command(
    "setup-ci <repoUrl> [branch] [repoPath]",
    "Setup CI environment",
    {},
    require("./commands/setupCi")
  )

  /**
   * Command: install-vscode
   * Description: Install Playwright VS Code extension automatically.
   */
  .command(
    "install-vscode",
    "Install Playwright extension for VS Code",
    {},
    require("./commands/installVSCode")
  )

  /**
   * Command: configure-retry
   * Description: Dynamically configure number of retries for flaky tests.
   */
  .command(
    "configure-retry <retries>",
    "Configure number of test retries",
    (yargs) => {
      return yargs.positional("retries", {
        describe: "Number of retries",
        type: "number",
      });
    },
    require("./commands/configureRetry")
  )

  /**
   * Command: use-typescript
   * Description: Upgrade the project to use TypeScript (adds configs and dependencies).
   */
  .command(
    "use-typescript",
    "Enable TypeScript support in project",
    {},
    require("./commands/useTypescript")
  )

  /**
   * Catch-all: help, error handling
   */
  .demandCommand()
  .help().argv;
