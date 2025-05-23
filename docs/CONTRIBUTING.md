# Contributing to Playwright Framework

Thank you for considering contributing to the Playwright Framework! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in the Issues section.
2. If not, create a new issue with a clear title and description.
3. Include steps to reproduce the bug, expected behavior, and actual behavior.
4. Include screenshots if applicable.
5. Specify your environment (OS, browser, Playwright version, etc.).

### Suggesting Enhancements

1. Check if the enhancement has already been suggested in the Issues section.
2. If not, create a new issue with a clear title and description.
3. Explain why this enhancement would be useful to most users.
4. Provide examples of how the enhancement would work.

### Pull Requests

1. Fork the repository.
2. Create a new branch from `main`.
3. Make your changes.
4. Run tests to ensure your changes don't break existing functionality.
5. Submit a pull request to the `main` branch.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/playwright-framework.git
   cd playwright-framework
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

5. Run tests:
   ```bash
   npm test
   ```

## Coding Standards

- Follow the ESLint and Prettier configurations provided in the project.
- Write clear, concise, and descriptive commit messages.
- Include comments for complex code sections.
- Write tests for new features or bug fixes.

## Testing

- Run tests before submitting a pull request:
  ```bash
  npm test
  ```

- Run linting:
  ```bash
  npm run lint
  ```

## Documentation

- Update documentation when adding or modifying features.
- Use JSDoc comments for functions and classes.
- Keep the README.md up to date.

## Review Process

1. A maintainer will review your pull request.
2. They may request changes or ask questions.
3. Once approved, your pull request will be merged.

Thank you for contributing to the Playwright Framework!