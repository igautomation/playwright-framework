#!/usr/bin/env node
import yargs from 'yargs';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import path from 'path';
import { listTags, runTests } from '../utils/cli/cliUtils.js';

yargs
  .command('init', 'Initialize a new project', () => {}, () => {
    try {
      const projectDir = 'new-project';
      fs.ensureDirSync(projectDir);

      // List of files/folders to copy
      const filesToCopy = [
        { src: 'src', dest: 'src' },
        { src: '.env.example', dest: '.env.example' },
        { src: 'src/config/playwright.config.js', dest: 'src/config/playwright.config.js' },
        { src: 'docs', dest: 'docs' },
        { src: '.github', dest: '.github' },
        { src: 'package.json', dest: 'package.json' },
        { src: '.eslintrc.js', dest: '.eslintrc.js' },
        { src: '.prettierrc', dest: '.prettierrc' },
        { src: '.husky', dest: '.husky' },
        { src: '.gitignore', dest: '.gitignore' },
        { src: 'LICENSE.md', dest: 'LICENSE.md' },
        { src: 'CHANGELOG.md', dest: 'CHANGELOG.md' },
        { src: 'CONTRIBUTING.md', dest: 'CONTRIBUTING.md' },
        { src: 'README.md', dest: 'README.md' },
        { src: 'src/utils/common/testDataFactory.js', dest: 'src/utils/common/testDataFactory.js' },
        { src: 'src/pages/locators/BaseLocator.js', dest: 'src/pages/locators/BaseLocator.js' },
        { src: 'src/pages/locators/LoginPageLocators.js', dest: 'src/pages/locators/LoginPageLocators.js' },
        { src: 'src/pages/LoginPage.js', dest: 'src/pages/LoginPage.js' },
        { src: 'src/data/json/credentials.json', dest: 'src/data/json/credentials.json' }, // Added
      ];

      // Validate and copy files
      for (const { src, dest } of filesToCopy) {
        if (!fs.existsSync(src)) {
          throw new Error(`Source file/folder not found: ${src}`);
        }
        fs.copySync(src, path.join(projectDir, dest), { errorOnExist: false });
        console.log(`Copied ${src} to ${path.join(projectDir, dest)}`);
      }

      // Initialize package.json if not copied
      const packageJsonPath = path.join(projectDir, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        fs.writeJsonSync(packageJsonPath, {
          name: 'playwright-framework-project',
          version: '1.0.0',
          scripts: {
            test: 'npx framework run',
            'list-tags': 'npx framework list-tags',
            'generate-report': 'npx framework generate-report',
            lint: 'eslint src',
            format: 'prettier --write src',
            'format:check': 'prettier --check src',
          },
          dependencies: {},
          devDependencies: {},
        });
        console.log('Generated fallback package.json');
      }

      // Install dependencies
      const dependencies = [
        '@playwright/test',
        'dotenv-safe',
        '@faker-js/faker',
        'uuid',
        'yargs',
        'fs-extra',
        'allure-playwright',
        'js-yaml',
        'csv-parse',
      ];
      execSync(`npm install ${dependencies.join(' ')}`, {
        cwd: projectDir,
        stdio: 'inherit',
      });
      console.log('Installed dependencies');

      // Initialize Husky in the new project
      execSync('npm run prepare', { cwd: projectDir, stdio: 'inherit' });
      console.log('Initialized Husky');

      console.log('Project scaffolded successfully!');
    } catch (error) {
      console.error(`Failed to scaffold project: ${error.message}`);
      process.exit(1);
    }
  })
  .command('run', 'Run tests', {
    tags: { description: 'Tag expression (e.g., "@api && @smoke")', type: 'string' },
    headed: { description: 'Run in headed mode', type: 'boolean' },
  }, (argv) => runTests(argv))
  .command('list-tags', 'List available tags', () => {}, () => listTags())
  .command('generate-report', 'Generate Allure report', () => {}, () => {
    execSync('npx allure generate reports/allure -o reports/allure-report --clean', {
      stdio: 'inherit',
    });
  })
  .demandCommand()
    .help();
  
  const argv = yargs.argv;