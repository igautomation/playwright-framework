#!/usr/bin/env node

/**
 * Test script to update GitHub workflow with additional features
 * This version includes a dry-run option to test changes without modifying the actual workflow file
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Parse command-line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

console.log(`Updating GitHub workflow... ${dryRun ? '(DRY RUN)' : ''}`);

// Path to the GitHub workflow file
// Allow overriding the path via environment variable for testing
const workflowPath = process.env.WORKFLOW_PATH || path.resolve(
  __dirname,
  '../.github/workflows/playwright.yml'
);

// Check if the file exists
if (!fs.existsSync(workflowPath)) {
  console.error(`Workflow file not found at: ${workflowPath}`);
  process.exit(1);
}

try {
  // Read the workflow file
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');

  // Parse YAML
  const workflow = yaml.load(workflowContent);

  // Add accessibility and performance jobs
  workflow.jobs.accessibility = {
    name: 'Accessibility Tests',
    'runs-on': 'ubuntu-latest',
    steps: [
      {
        uses: 'actions/checkout@v4',
      },
      {
        name: 'Set up Node.js',
        uses: 'actions/setup-node@v4',
        with: {
          'node-version': '18',
          cache: 'npm',
        },
      },
      {
        name: 'Install dependencies',
        run: 'npm ci',
      },
      {
        name: 'Install Playwright browsers',
        run: 'npx playwright install --with-deps',
      },
      {
        name: 'Create .env file',
        run: [
          'cp .env.example .env',
          'echo "BASE_URL=${{ secrets.BASE_URL }}" >> .env',
          'echo "API_URL=${{ secrets.API_URL }}" >> .env',
          'echo "USERNAME=${{ secrets.USERNAME }}" >> .env',
          'echo "PASSWORD=${{ secrets.PASSWORD }}" >> .env',
        ].join('\n'),
      },
      {
        name: 'Run accessibility tests',
        run: 'npm run test:accessibility',
      },
      {
        name: 'Upload accessibility results',
        if: 'always()',
        uses: 'actions/upload-artifact@v4',
        with: {
          name: 'accessibility-results',
          path: 'reports/accessibility',
          'retention-days': 30,
        },
      },
    ],
  };

  workflow.jobs.performance = {
    name: 'Performance Tests',
    'runs-on': 'ubuntu-latest',
    steps: [
      {
        uses: 'actions/checkout@v4',
      },
      {
        name: 'Set up Node.js',
        uses: 'actions/setup-node@v4',
        with: {
          'node-version': '18',
          cache: 'npm',
        },
      },
      {
        name: 'Install dependencies',
        run: 'npm ci',
      },
      {
        name: 'Install Playwright browsers',
        run: 'npx playwright install --with-deps',
      },
      {
        name: 'Create .env file',
        run: [
          'cp .env.example .env',
          'echo "BASE_URL=${{ secrets.BASE_URL }}" >> .env',
          'echo "API_URL=${{ secrets.API_URL }}" >> .env',
          'echo "USERNAME=${{ secrets.USERNAME }}" >> .env',
          'echo "PASSWORD=${{ secrets.PASSWORD }}" >> .env',
        ].join('\n'),
      },
      {
        name: 'Run performance tests',
        run: 'npm run test:performance',
      },
      {
        name: 'Upload performance results',
        if: 'always()',
        uses: 'actions/upload-artifact@v4',
        with: {
          name: 'performance-results',
          path: ['reports/performance', 'reports/lighthouse'],
          'retention-days': 30,
        },
      },
    ],
  };

  // Add visual regression job
  workflow.jobs.visual = {
    name: 'Visual Regression Tests',
    'runs-on': 'ubuntu-latest',
    steps: [
      {
        uses: 'actions/checkout@v4',
      },
      {
        name: 'Set up Node.js',
        uses: 'actions/setup-node@v4',
        with: {
          'node-version': '18',
          cache: 'npm',
        },
      },
      {
        name: 'Install dependencies',
        run: 'npm ci',
      },
      {
        name: 'Install Playwright browsers',
        run: 'npx playwright install --with-deps',
      },
      {
        name: 'Create .env file',
        run: [
          'cp .env.example .env',
          'echo "BASE_URL=${{ secrets.BASE_URL }}" >> .env',
          'echo "API_URL=${{ secrets.API_URL }}" >> .env',
          'echo "USERNAME=${{ secrets.USERNAME }}" >> .env',
          'echo "PASSWORD=${{ secrets.PASSWORD }}" >> .env',
        ].join('\n'),
      },
      {
        name: 'Run visual tests',
        run: 'npm run test:visual',
      },
      {
        name: 'Upload visual test results',
        if: 'always()',
        uses: 'actions/upload-artifact@v4',
        with: {
          name: 'visual-test-results',
          path: ['test-results', 'playwright-report'],
          'retention-days': 30,
        },
      },
    ],
  };

  // Add docs job
  workflow.jobs.docs = {
    name: 'Build and Deploy Docs',
    'runs-on': 'ubuntu-latest',
    needs: ['report'],
    if: "github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'",
    steps: [
      {
        uses: 'actions/checkout@v4',
      },
      {
        name: 'Set up Node.js',
        uses: 'actions/setup-node@v4',
        with: {
          'node-version': '18',
          cache: 'npm',
        },
      },
      {
        name: 'Install dependencies',
        run: 'cd docs-site && npm ci',
      },
      {
        name: 'Build documentation',
        run: 'cd docs-site && npm run build',
      },
      {
        name: 'Generate PDF guide',
        run: 'node scripts/generate-pdf-guide.js',
      },
      {
        name: 'Deploy to GitHub Pages',
        uses: 'peaceiris/actions-gh-pages@v3',
        with: {
          github_token: '${{ secrets.GITHUB_TOKEN }}',
          publish_dir: './docs-site/build',
          destination_dir: 'docs',
        },
      },
    ],
  };

  // Add proper string escaping for GitHub Actions expressions
  const stringifyWithEscaping = (obj) => {
    // Convert to string first
    let yamlStr = yaml.dump(obj, { lineWidth: -1, quotingType: '"' });
    
    // Fix GitHub Actions expressions to prevent YAML parsing issues
    // We need to ensure expressions like ${{ secrets.API_URL }} are preserved correctly
    yamlStr = yamlStr.replace(/"\${{ (.*?) }}"/g, "${{ $1 }}");
    
    return yamlStr;
  };

  // Function to check if GitHub Actions expressions are preserved correctly
  const validateGitHubActionsExpressions = (yamlContent) => {
    const expressionRegex = /\${{.*?}}/g;
    const matches = yamlContent.match(expressionRegex) || [];
    console.log(`Found ${matches.length} GitHub Actions expressions:`);
    matches.forEach(match => console.log(`  - ${match}`));
  };

  // Convert back to YAML with proper escaping
  const updatedWorkflowContent = stringifyWithEscaping(workflow);

  // Validate the generated YAML
  try {
    const parsedYaml = yaml.load(updatedWorkflowContent);
    console.log('Generated YAML is valid.');
    validateGitHubActionsExpressions(updatedWorkflowContent);
  } catch (error) {
    console.error('Generated YAML is invalid:', error);
    process.exit(1);
  }

  // Write the updated workflow file or output to console in dry run mode
  if (!dryRun) {
    fs.writeFileSync(workflowPath, updatedWorkflowContent);
    console.log('GitHub workflow updated successfully!');
  } else {
    console.log('DRY RUN: GitHub workflow would be updated as follows:');
    // Print a summary of the actions used instead of the full YAML for better readability
    const actionsUsed = [];
    const findActions = (obj) => {
      if (typeof obj !== 'object' || obj === null) return;
      
      if (obj.uses && typeof obj.uses === 'string' && obj.uses.startsWith('actions/')) {
        actionsUsed.push(obj.uses);
      }
      
      for (const key in obj) {
        findActions(obj[key]);
      }
    };
    
    findActions(workflow);
    console.log('Actions used in the workflow:');
    const uniqueActions = [...new Set(actionsUsed)];
    uniqueActions.forEach(action => console.log(`  - ${action}`));
    
    // Still output the full YAML for debugging if needed
    if (args.includes('--verbose')) {
      console.log('\nFull YAML:');
      console.log(updatedWorkflowContent);
    }
  }
} catch (error) {
  console.error('Failed to update GitHub workflow:', error);
  process.exit(1);
}