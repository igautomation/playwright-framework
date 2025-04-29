import { execSync } from "child_process";

function run(argv) {
  let command = "npx playwright test";

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

  console.log(`Executing: ${command}`);
  execSync(command, { stdio: "inherit" });
}

module.exports = run;
