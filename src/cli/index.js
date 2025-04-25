#!/usr/bin/env node
const yargs = require('yargs');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const { listTags, runTests } = require('../utils/cli/cliUtils');

yargs
  .command('init', 'Initialize a new project', () => {}, () => {
    fs.ensureDirSync('new-project');
    fs.copySync('src', 'new-project/src');
    fs.copySync('.env.example', 'new-project/.env.example');
    fs.copySync('playwright.config.js', 'new-project/playwright.config.js');
    execSync('npm install @playwright/test dotenv-safe @faker-js/faker uuid', { cwd: 'new-project' });
    console.log('Project initialized successfully!');
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