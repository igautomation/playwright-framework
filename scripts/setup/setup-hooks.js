/**
 * Setup Git hooks for the project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the hooks directory
const hooksDir = path.join(__dirname, '../../.husky');

// Create the hooks directory if it doesn't exist
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
  console.log('Created .husky directory');
}

// Setup pre-commit hook
const preCommitPath = path.join(hooksDir, 'pre-commit');
const preCommitContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linting and formatting before commit
npm run lint
npm run format
`;

fs.writeFileSync(preCommitPath, preCommitContent);
fs.chmodSync(preCommitPath, 0o755); // Make executable
console.log('Created pre-commit hook');

// Setup pre-push hook
const prePushPath = path.join(hooksDir, 'pre-push');
const prePushContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests before push
npm test
`;

fs.writeFileSync(prePushPath, prePushContent);
fs.chmodSync(prePushPath, 0o755); // Make executable
console.log('Created pre-push hook');

// Create _/husky.sh file
const huskyShDir = path.join(hooksDir, '_');
if (!fs.existsSync(huskyShDir)) {
  fs.mkdirSync(huskyShDir, { recursive: true });
}

const huskyShPath = path.join(huskyShDir, 'husky.sh');
const huskyShContent = `#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  export readonly husky_skip_init=1
  sh -e "$0" "$@"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "husky - $hook_name hook exited with code $exitCode (error)"
  fi

  exit $exitCode
fi
`;

fs.writeFileSync(huskyShPath, huskyShContent);
fs.chmodSync(huskyShPath, 0o755); // Make executable
console.log('Created husky.sh');

console.log('Git hooks setup complete!');