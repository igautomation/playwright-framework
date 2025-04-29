// src/utils/cli/cliUtils.js

/**
 * CLI Utilities for Playwright Automation Framework (ESM Compliant).
 *
 * Responsibilities:
 * - List available test tags across the project
 * - Run Playwright tests with optional tag expressions and headed mode
 */

import glob from 'glob';
import { promises as fs } from 'fs';
import { execSync } from 'child_process';

/**
 * Lists all unique tags across test files.
 *
 * Parses all `.spec.js` files under `src/tests/`,
 * extracts @tags, and prints a categorized list.
 *
 * @returns {Promise<void>}
 */
async function listTags() {
  const files = glob.sync('src/tests/**/*.spec.js');
  const tags = new Set();
  const tagMap = {};

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const matches = content.match(/@[\w-]+/g) || [];
    matches.forEach((tag) => {
      tags.add(tag);
      tagMap[tag] = tagMap[tag] ? [...tagMap[tag], file] : [file];
    });
  }

  if (tags.size === 0) {
    console.log('No tags found in test files.');
    return;
  }

  console.log('Available tags:');
  Array.from(tags)
    .sort()
    .forEach((tag) => {
      console.log(`- ${tag} [Found in: ${tagMap[tag].join(', ')}]`);
    });
}

/**
 * Runs Playwright tests with optional filtering and headed mode.
 *
 * @param {object} argv - CLI arguments.
 * @param {string} [argv.tags] - Tag expression to filter tests.
 * @param {boolean} [argv.headed] - Whether to run in headed mode.
 */
function runTests(argv) {
  const tags = argv.tags ? `--grep "${argv.tags}"` : '';
  const headed = argv.headed ? '--headed' : '';
  const cmd = `npx playwright test ${tags} ${headed}`.trim();

  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error running tests:', error.message);
    process.exit(1);
  }
}

export { listTags, runTests };