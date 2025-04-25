const glob = require('glob');
const fs = require('fs').promises;
const { execSync } = require('child_process');

/**
 * Lists all unique tags across test files.
 * @returns {Promise<void>}
 */
async function listTags() {
  const files = glob.sync('src/tests/**/*.spec.js');
  const tags = new Set();
  const tagMap = {};

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const matches = content.match(/@[\w-]+/g) || [];
    matches.forEach(tag => {
      tags.add(tag);
      tagMap[tag] = tagMap[tag] ? [...tagMap[tag], file] : [file];
    });
  }

  console.log('Available tags:');
  Array.from(tags).sort().forEach(tag => {
    console.log(`- ${tag} (${tagMap[tag].join(', ')})`);
  });
}

/**
 * Runs tests with optional tag expression and headed mode.
 * @param {object} argv - CLI arguments
 */
function runTests(argv) {
  const tags = argv.tags ? `--grep "${argv.tags}"` : '';
  const headed = argv.headed ? '--headed' : '';
  const cmd = `npx playwright test ${tags} ${headed}`.trim();
  execSync(cmd, { stdio: 'inherit' });
}

module.exports = { listTags, runTests };