// src/cli/commands/run.js
import { execSync } from "child_process";
import logger from "../../utils/common/logger.js";

function run(argv) {
  let command = "npx playwright test";

  if (argv.files && argv.files.length) {
    command += ` ${argv.files.join(" ")}`;
  }
  if (argv.tags) {
    command += ` --grep "${argv.tags}"`;
  }
  if (argv.headed) {
    command += " --headed";
  }
  if (argv.project) {
    command += ` --project=${argv.project.join(" ")}`;
  }
  if (argv.workers) {
    command += ` --workers=${argv.workers}`;
  }
  if (argv.retries !== undefined) {
    command += ` --retries=${argv.retries}`;
  }

  logger.info(`Executing: ${command}`);
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    logger.error(`Playwright test execution failed: ${error.message}`);
    process.exit(1);
  }
}

export default run;
