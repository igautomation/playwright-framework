// run-tests.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Making shell scripts executable...');
try {
  // Make all shell scripts in the scripts directory executable
  const scriptsDir = path.join(__dirname, 'scripts');
  const files = fs.readdirSync(scriptsDir);
  
  for (const file of files) {
    if (file.endsWith('.sh')) {
      const filePath = path.join(scriptsDir, file);
      fs.chmodSync(filePath, '755');
      console.log(`Made ${file} executable`);
    }
  }
  
  console.log('All shell scripts are now executable.');
} catch (error) {
  console.error('Error making scripts executable:', error);
}

console.log('\nRunning tests...');
try {
  // Run the tests
  execSync('npm test', { stdio: 'inherit' });
  console.log('Tests completed successfully!');
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}