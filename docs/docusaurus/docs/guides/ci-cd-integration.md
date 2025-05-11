---
sidebar_position: 6
---

# CI/CD Integration

The Playwright Framework provides built-in support for integrating with popular CI/CD systems like GitHub Actions, Jenkins, and GitLab CI.

## Overview

CI/CD integration allows you to:

- Run tests automatically on code changes
- Enforce quality gates with test verification
- Generate and publish test reports
- Track test metrics over time
- Deploy applications after successful tests

## Supported CI/CD Systems

The framework supports the following CI/CD systems:

- **GitHub Actions**
- **Jenkins**
- **GitLab CI**
- **Azure DevOps**
- **CircleCI**
- **Travis CI**

## Setting Up CI/CD Integration

You can set up CI/CD integration using the built-in CLI command:

```bash
npm run ci:setup
# or
npx playwright-framework ci-setup --system github --name "Playwright Tests"
```

### Options

```bash
npx playwright-framework ci-setup [options]

Options:
  -s, --system <system>         CI system (github, jenkins, gitlab)
  -n, --name <name>             Workflow/pipeline name
  -b, --branches <branches>     Comma-separated list of branches to trigger on
  --node-version <version>      Node.js version
  --test-command <command>      Test command
  --report-command <command>    Report command
```

## GitHub Actions Integration

### Setup

```bash
npx playwright-framework ci-setup --system github --name "Playwright Tests" --branches main,develop
```

This will generate a GitHub Actions workflow file (`.github/workflows/playwright-tests.yml`).

### Example Workflow

```yaml
name: Playwright Tests

on:
  push:
    branches: ['main', 'develop']
  pull_request:
    branches: ['main', 'develop']
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run Playwright tests
        run: npm test
        
      - name: Generate test reports
        if: always()
        run: npm run report
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: reports
          retention-days: 30
```

### Advanced Configuration

You can customize the workflow by adding:

- **Test Verification**: Add steps to verify and lint tests
- **Test Coverage**: Add steps to analyze test coverage
- **Parallel Testing**: Configure matrix builds for parallel testing
- **Deployment**: Add deployment steps after successful tests

```yaml
# Example with test verification and coverage
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run verify
      - run: npm run lint
      - run: npm run coverage -- --threshold 80
      
  test:
    needs: verify
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test -- --shard=${{ matrix.shard }}/3
```

## Jenkins Integration

### Setup

```bash
npx playwright-framework ci-setup --system jenkins --name "Playwright Tests"
```

This will generate a Jenkinsfile in your project root.

### Example Jenkinsfile

```groovy
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.35.0-focal'
        }
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Report') {
            steps {
                sh 'npm run report'
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports/html',
                reportFiles: 'index.html',
                reportName: 'Test Report'
            ])
        }
    }
}
```

### Advanced Configuration

You can customize the Jenkins pipeline by adding:

- **Parallel Stages**: Run tests in parallel
- **Test Verification**: Add stages for test verification
- **Test Coverage**: Add stages for coverage analysis
- **Notifications**: Add notification steps

```groovy
// Example with parallel testing
stage('Test') {
    parallel {
        stage('Chrome Tests') {
            steps {
                sh 'npm test -- --project=chromium'
            }
        }
        stage('Firefox Tests') {
            steps {
                sh 'npm test -- --project=firefox'
            }
        }
        stage('WebKit Tests') {
            steps {
                sh 'npm test -- --project=webkit'
            }
        }
    }
}
```

## GitLab CI Integration

### Setup

```bash
npx playwright-framework ci-setup --system gitlab --name "Playwright Tests"
```

This will generate a GitLab CI configuration file (`.gitlab-ci.yml`).

### Example Configuration

```yaml
image: mcr.microsoft.com/playwright:v1.35.0-focal

stages:
  - test

variables:
  npm_config_cache: "$CI_PROJECT_DIR/.npm"

cache:
  key: node-modules
  paths:
    - .npm/

test:
  stage: test
  script:
    - npm ci
    - npm test
    - npm run report
  artifacts:
    paths:
      - reports/
    expire_in: 1 week
```

### Advanced Configuration

You can customize the GitLab CI configuration by adding:

- **Multiple Jobs**: Split testing into multiple jobs
- **Test Verification**: Add jobs for test verification
- **Test Coverage**: Add jobs for coverage analysis
- **Deployment**: Add deployment jobs

```yaml
# Example with multiple jobs
stages:
  - verify
  - test
  - report

verify:
  stage: verify
  script:
    - npm ci
    - npm run verify
    - npm run lint

test:chrome:
  stage: test
  script:
    - npm ci
    - npx playwright install chromium
    - npm test -- --project=chromium

test:firefox:
  stage: test
  script:
    - npm ci
    - npx playwright install firefox
    - npm test -- --project=firefox

report:
  stage: report
  script:
    - npm ci
    - npm run report
    - npm run dashboard -- --add-run
  artifacts:
    paths:
      - reports/
    expire_in: 1 week
```

## Best Practices

### General CI/CD Best Practices

1. **Cache Dependencies**: Cache npm dependencies to speed up builds
2. **Use Docker Images**: Use official Playwright Docker images
3. **Parallel Testing**: Run tests in parallel to reduce build time
4. **Artifacts**: Save test reports and screenshots as artifacts
5. **Notifications**: Configure notifications for failed builds

### GitHub Actions Best Practices

1. **Use Matrix Builds**: Use matrix builds for parallel testing
2. **Cache Node Modules**: Use the `actions/cache` action to cache node modules
3. **Upload Artifacts**: Always upload test reports as artifacts

### Jenkins Best Practices

1. **Use Docker Agent**: Use the official Playwright Docker image
2. **Archive Artifacts**: Archive test reports and screenshots
3. **Publish HTML Reports**: Use the HTML Publisher plugin for test reports

### GitLab CI Best Practices

1. **Use Cache**: Cache npm dependencies between jobs
2. **Use Artifacts**: Save test reports as artifacts
3. **Use Pages**: Deploy test reports to GitLab Pages

## Troubleshooting

### Common Issues

1. **Browser Installation Fails**

   Solution: Use the official Playwright Docker image or install system dependencies:
   ```bash
   npx playwright install-deps
   ```

2. **Tests Fail in CI but Pass Locally**

   Solutions:
   - Check for environment-specific issues
   - Run tests in headed mode locally with `PWDEBUG=1`
   - Add more logging to tests
   - Check for race conditions

3. **Out of Memory Errors**

   Solutions:
   - Increase memory limit in CI configuration
   - Run fewer tests in parallel
   - Check for memory leaks in tests

4. **Slow CI Builds**

   Solutions:
   - Cache dependencies
   - Run tests in parallel
   - Use test sharding
   - Skip unnecessary browser installations