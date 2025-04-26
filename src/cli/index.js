#!/usr/bin/env node
const yargs = require('yargs');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const path = require('path');
const { listTags, runTests } = require('../utils/cli/cliUtils');

yargs
  .command('init', 'Initialize a new project', () => {}, () => {
    try {
      // Ensure new-project directory exists
      const projectDir = 'new-project';
      fs.ensureDirSync(projectDir);

      // Copy essential files and folders
      fs.copySync('src', path.join(projectDir, 'src'), { errorOnExist: false });
      fs.copySync('.env.example', path.join(projectDir, '.env.example'));
      fs.copySync('playwright.config.js', path.join(projectDir, 'playwright.config.js'));

      // Copy additional folders/files as per the prompt
      fs.copySync('docs', path.join(projectDir, 'docs'), { errorOnExist: false });
      fs.copySync('.github', path.join(projectDir, '.github'), { errorOnExist: false });
      fs.copySync('package.json', path.join(projectDir, 'package.json'));
      fs.copySync('.eslintrc.js', path.join(projectDir, '.eslintrc.js'));
      fs.copySync('.prettierrc', path.join(projectDir, '.prettierrc'));
      fs.copySync('LICENSE.md', path.join(projectDir, 'LICENSE.md'));
      fs.copySync('CHANGELOG.md', path.join(projectDir, 'CHANGELOG.md'));
      fs.copySync('CONTRIBUTING.md', path.join(projectDir, 'CONTRIBUTING.md'));
      fs.copySync('README.md', path.join(projectDir, 'README.md'));

      // Initialize package.json if not copied (optional, as a fallback)
      if (!fs.existsSync(path.join(projectDir, 'package.json'))) {
        fs.writeJsonSync(path.join(projectDir, 'package.json'), {
          name: 'playwright-framework-project',
          version: '1.0.0',
          scripts: {
            test: 'npx framework run',
            'list-tags': 'npx framework list-tags',
            'generate-report': 'npx framework generate-report',
          },
          dependencies: {},
        });
      }

      // Install dependencies in new-project
      execSync('npm install @playwright/test dotenv-safe @faker-js/faker uuid', {
        cwd: projectDir,
        stdio: 'inherit',
      });

      console.log('Project scaffolded successfully!');
    } catch (error) {
      console.error('Failed to scaffold project:', error.message);
      process.exit(1);
    }
  })
  .command('run', 'Run tests', {
    tags: { description: 'Tag expression (e.g., "@api && @smoke")', type: 'string' },
    headed: { description: 'Run in headed mode', type: 'boolean' },
  }, (argv) => runTests(argv))
  .command('list-tags', 'List available tags', () => {}, () => listTags())
  .command('generate-report', 'Generate Allure report', () => {}, () => {
    execSync('npx allure generate reports/allure -o reports/allure-report --clean');
  })
  .demandCommand()
  .help().argv;