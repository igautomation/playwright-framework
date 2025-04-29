// src/config/project.config.js
import { loadEnv } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import logger from "../utils/common/logger.js";
import { getConfig } from "./defaults.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default project settings
const projectConfig = {
  default: {
    name: "default",
    envFile: join(__dirname, "..", "config", "env", "dev.env"), // Optional .env file
    requiredEnvVars: ["BASE_URL", "API_BASE_URL"], // Project-specific required variables
    ui: {
      baseURL: process.env.BASE_URL || getConfig("ui", "baseURL"),
    },
    api: {
      baseURL: process.env.API_BASE_URL || getConfig("api", "baseURL"),
    },
    testPatterns: {
      ui: /.*\.ui\.spec\.js/,
      api: /.*\.api\.spec\.js/,
      unit: /.*\.unit\.spec\.js/,
      setup: /global\.setup\.js/,
      teardown: /global\.teardown\.js/,
    },
    browsers: [
      { name: "chromium", config: { ...devices["Desktop Chrome"] } },
      { name: "firefox", config: { ...devices["Desktop Firefox"] } },
      { name: "webkit", config: { ...devices["Desktop Safari"] } },
      { name: "mobile-chrome", config: { ...devices["Pixel 5"] } },
      { name: "mobile-safari", config: { ...devices["iPhone 12"] } },
      {
        name: "google-chrome",
        config: { ...devices["Desktop Chrome"], channel: "chrome" },
      },
      {
        name: "microsoft-edge",
        config: { ...devices["Desktop Edge"], channel: "msedge" },
      },
    ],
    browserStack:
      process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_ACCESS_KEY
        ? {
            enabled: true,
            config: {
              browserName: "chromium",
              "bstack:options": {
                os: process.env.BSTACK_OS || "Windows",
                osVersion: process.env.BSTACK_OS_VERSION || "11",
                browserVersion: process.env.BSTACK_BROWSER_VERSION || "latest",
                projectName: "Playwright Framework",
                buildName: process.env.BSTACK_BUILD_NAME || "playwright-build",
                sessionName: "Playwright Test",
                local: false,
                userName: process.env.BROWSERSTACK_USERNAME,
                accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
              },
              connectOptions: {
                wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
                  JSON.stringify({
                    "bstack:options": {
                      userName: process.env.BROWSERSTACK_USERNAME,
                      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
                    },
                  })
                )}`,
              },
            },
          }
        : { enabled: false },
  },
  // Add more projects here for new applications
  // Example:
  // myProject: {
  //   name: 'myProject',
  //   envFile: join(__dirname, '..', 'config', 'env', 'myProject.env'),
  //   requiredEnvVars: ['MY_PROJECT_BASE_URL', 'MY_PROJECT_API_BASE_URL'],
  //   ui: { baseURL: process.env.MY_PROJECT_BASE_URL || 'https://myproject.com' },
  //   api: { baseURL: process.env.MY_PROJECT_API_BASE_URL || 'https://api.myproject.com' },
  //   testPatterns: { ... },
  //   browsers: [ ... ],
  // },
};

/**
 * Retrieves project configuration for the specified project and environment.
 * @param {string} [projectName='default'] - Project name.
 * @param {string} [env='dev'] - Environment (dev, qa, prod).
 * @returns {object} Project configuration.
 */
export function getProjectConfig(projectName = "default", env = "dev") {
  const config = projectConfig[projectName] || projectConfig.default;
  if (!config) {
    logger.error(
      `Project configuration not found for ${projectName}. Using default.`
    );
    return projectConfig.default;
  }

  // Optionally load .env file if specified and exists
  if (config.envFile && existsSync(config.envFile)) {
    try {
      loadEnv({ path: config.envFile, override: true });
      logger.info(`Loaded environment variables from ${config.envFile}`);
    } catch (error) {
      logger.warn(
        `Failed to load environment file ${config.envFile}: ${error.message}. Using existing environment variables.`
      );
    }
  } else if (config.envFile) {
    logger.warn(
      `Environment file ${config.envFile} not found. Using existing environment variables.`
    );
  }

  // Validate required environment variables
  const missingVars = (config.requiredEnvVars || []).filter(
    (varName) => !process.env[varName]
  );
  if (missingVars.length > 0) {
    logger.warn(
      `Missing environment variables for ${projectName}: ${missingVars.join(
        ", "
      )}. Using defaults.`
    );
  }

  // Apply environment-specific overrides
  const envConfig = {
    ...config,
    ui: {
      ...config.ui,
      baseURL:
        process.env[`${projectName.toUpperCase()}_BASE_URL`] ||
        process.env.BASE_URL ||
        config.ui.baseURL,
    },
    api: {
      ...config.api,
      baseURL:
        process.env[`${projectName.toUpperCase()}_API_BASE_URL`] ||
        process.env.API_BASE_URL ||
        config.api.baseURL,
    },
  };

  logger.info(`Loaded project configuration for ${projectName} (${env}):`, {
    uiBaseURL: envConfig.ui.baseURL,
    apiBaseURL: envConfig.api.baseURL,
    browsers: envConfig.browsers.map((b) => b.name),
    browserStack: envConfig.browserStack.enabled,
    requiredEnvVars: envConfig.requiredEnvVars || [],
  });

  return envConfig;
}

export default projectConfig;
