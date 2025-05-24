# Git Hooks

This document describes the Git hooks configured in the Playwright Framework.

## Overview

Git hooks are scripts that Git executes before or after events such as commit, push, and receive. We use them to enforce code quality and run tests before code is committed or pushed to the repository.

## Available Hooks

### pre-commit

The pre-commit hook runs before a commit is created. It performs the following tasks:

- Runs ESLint to check for code quality issues
- Runs Prettier to ensure consistent code formatting

This hook only checks files that are staged for commit, using the lint-staged package.

### pre-push

The pre-push hook runs before pushing commits to a remote repository. It performs the following tasks:

- Runs smoke tests to ensure basic functionality is working

If the smoke tests fail, the push is aborted, preventing broken code from being pushed to the repository.

## Configuration

### lint-staged

The lint-staged configuration is defined in `.lintstagedrc`:

```json
{
  "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

This configuration runs ESLint and Prettier on JavaScript/TypeScript files, and Prettier on JSON, Markdown, and YAML files.

## Skipping Hooks

In rare cases, you may need to bypass the Git hooks. You can do this by using the `--no-verify` flag:

```bash
git commit --no-verify -m "Your commit message"
git push --no-verify
```

**Note:** This should only be done in exceptional circumstances, as it bypasses the quality checks.

## Troubleshooting

If you encounter issues with the Git hooks:

1. Make sure the hook scripts are executable: `chmod +x .husky/pre-commit .husky/pre-push`
2. Verify that husky is installed: `npm list husky`
3. Check that the hooks are properly set up: `ls -la .git/hooks`

## Adding New Hooks

To add a new Git hook:

1. Create a new file in the `.husky` directory with the name of the hook
2. Make the file executable: `chmod +x .husky/hook-name`
3. Add the hook logic to the file

Example:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Your hook logic here
```