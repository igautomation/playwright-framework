/**
 * CLI Utilities for Playwright Automation Framework
 * 
 * Provides utilities for command-line operations
 */
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Lists all unique tags across test files
 * @param {Object} options - Options
 * @param {string} options.testDir - Directory containing test files
 * @param {string} options.pattern - Glob pattern for test files
 * @returns {Promise<Object>} Object with tags and their locations
 */
async function listTags(options = {}) {
  const testDir = options.testDir || 'src/tests';
  const pattern = options.pattern || '**/*.spec.js';
  const files = glob.sync(path.join(testDir, pattern));
  const tags = new Set();
  const tagMap = {};

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/@[\w-]+/g) || [];
    matches.forEach((tag) => {
      tags.add(tag);
      tagMap[tag] = tagMap[tag] ? [...tagMap[tag], file] : [file];
    });
  }

  if (tags.size === 0) {
    console.log('No tags found in test files.');
    return { tags: [], tagMap: {} };
  }

  console.log('Available tags:');
  Array.from(tags)
    .sort()
    .forEach((tag) => {
      console.log(`- ${tag} [Found in: ${tagMap[tag].length} files]`);
    });
    
  return {
    tags: Array.from(tags),
    tagMap
  };
}

/**
 * Runs Playwright tests with optional filtering and headed mode
 * @param {Object} options - Options
 * @param {string} options.tags - Tag expression to filter tests
 * @param {boolean} options.headed - Whether to run in headed mode
 * @param {boolean} options.debug - Whether to run in debug mode
 * @param {string} options.project - Project to run
 * @param {number} options.workers - Number of workers
 * @param {string} options.reporter - Reporter to use
 * @param {string} options.outputDir - Output directory for results
 * @returns {Object} Result of test run
 */
function runTests(options = {}) {
  const args = [];
  
  // Add tag expression if provided
  if (options.tags) {
    args.push(`--grep "${options.tags}"`);
  }
  
  // Add headed mode if requested
  if (options.headed) {
    args.push('--headed');
  }
  
  // Add debug mode if requested
  if (options.debug) {
    args.push('--debug');
  }
  
  // Add project if specified
  if (options.project) {
    args.push(`--project=${options.project}`);
  }
  
  // Add workers if specified
  if (options.workers) {
    args.push(`--workers=${options.workers}`);
  }
  
  // Add reporter if specified
  if (options.reporter) {
    args.push(`--reporter=${options.reporter}`);
  }
  
  // Add output directory if specified
  if (options.outputDir) {
    args.push(`--output=${options.outputDir}`);
  }
  
  const cmd = `npx playwright test ${args.join(' ')}`.trim();
  console.log(`Running command: ${cmd}`);

  try {
    execSync(cmd, { stdio: 'inherit' });
    return { success: true, command: cmd };
  } catch (error) {
    console.error('Error running tests:', error.message);
    return { success: false, error: error.message, command: cmd };
  }
}

/**
 * Run Playwright codegen
 * @param {Object} options - Options
 * @param {string} options.url - URL to navigate to
 * @param {string} options.outputFile - File to save the generated code
 * @param {string} options.browser - Browser to use
 * @returns {Object} Result of codegen run
 */
function runCodegen(options = {}) {
  const args = ['codegen'];
  
  // Add URL if provided
  if (options.url) {
    args.push(options.url);
  }
  
  // Add output file if specified
  if (options.outputFile) {
    args.push(`--output ${options.outputFile}`);
  }
  
  // Add browser if specified
  if (options.browser) {
    args.push(`--browser ${options.browser}`);
  }
  
  const cmd = `npx playwright ${args.join(' ')}`.trim();
  console.log(`Running command: ${cmd}`);

  try {
    execSync(cmd, { stdio: 'inherit' });
    return { success: true, command: cmd };
  } catch (error) {
    console.error('Error running codegen:', error.message);
    return { success: false, error: error.message, command: cmd };
  }
}

/**
 * Parse tag expression
 * @param {string} expression - Tag expression
 * @returns {Function} Function that evaluates if a set of tags matches the expression
 */
function parseTagExpression(expression) {
  if (!expression) {
    return () => true;
  }
  
  // Tokenize the expression
  const tokens = expression.match(/(@[\w-]+|\(|\)|\|\||&&|!)/g) || [];
  
  // Convert to postfix notation using Shunting Yard algorithm
  const precedence = {
    '!': 3,
    '&&': 2,
    '||': 1
  };
  
  const output = [];
  const operators = [];
  
  for (const token of tokens) {
    if (token.startsWith('@')) {
      output.push(token);
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length > 0 && operators[operators.length - 1] !== '(') {
        output.push(operators.pop());
      }
      operators.pop(); // Discard the '('
    } else {
      while (
        operators.length > 0 &&
        operators[operators.length - 1] !== '(' &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        output.push(operators.pop());
      }
      operators.push(token);
    }
  }
  
  while (operators.length > 0) {
    output.push(operators.pop());
  }
  
  // Evaluate the expression
  return (tags) => {
    const stack = [];
    
    for (const token of output) {
      if (token.startsWith('@')) {
        stack.push(tags.includes(token));
      } else if (token === '!') {
        stack.push(!stack.pop());
      } else if (token === '&&') {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a && b);
      } else if (token === '||') {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a || b);
      }
    }
    
    return stack.pop() || false;
  };
}

/**
 * Find tests matching a tag expression
 * @param {string} expression - Tag expression
 * @param {Object} options - Options
 * @returns {Promise<Array<string>>} Array of matching test files
 */
async function findTestsByTagExpression(expression, options = {}) {
  const { tags, tagMap } = await listTags(options);
  const evaluator = parseTagExpression(expression);
  
  // Find all test files
  const testDir = options.testDir || 'src/tests';
  const pattern = options.pattern || '**/*.spec.js';
  const allFiles = glob.sync(path.join(testDir, pattern));
  
  // Find files that match the expression
  const matchingFiles = [];
  
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const fileTags = (content.match(/@[\w-]+/g) || []);
    
    if (evaluator(fileTags)) {
      matchingFiles.push(file);
    }
  }
  
  return matchingFiles;
}

/**
 * Generate a new test file from a template
 * @param {Object} options - Options
 * @param {string} options.name - Test name
 * @param {string} options.type - Test type (ui, api, visual, etc.)
 * @param {string} options.outputDir - Output directory
 * @param {Array<string>} options.tags - Tags to add to the test
 * @returns {string} Path to the generated test file
 */
function generateTest(options = {}) {
  if (!options.name) {
    throw new Error('Test name is required');
  }
  
  const type = options.type || 'ui';
  const outputDir = options.outputDir || path.join('src/tests', type);
  const tags = options.tags || ['@generated'];
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate file name
  const fileName = `${options.name.toLowerCase().replace(/\s+/g, '-')}.spec.js`;
  const filePath = path.join(outputDir, fileName);
  
  // Generate test content
  const content = `/**
 * ${options.name}
 * ${tags.join(' ')}
 */
const { test, expect } = require('@playwright/test');

test.describe('${options.name}', () => {
  test('should pass', async ({ page }) => {
    // Navigate to the page
    await page.goto(process.env.BASE_URL || 'https://example.com');
    
    // Verify the page loaded
    await expect(page).toHaveTitle(/Example Domain/);
  });
});
`;
  
  // Write the file
  fs.writeFileSync(filePath, content);
  console.log(`Generated test file: ${filePath}`);
  
  return filePath;
}

module.exports = {
  listTags,
  runTests,
  runCodegen,
  parseTagExpression,
  findTestsByTagExpression,
  generateTest
};