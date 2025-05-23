const fs = require('fs');
const path = require('path');

// Function to fix a test file
function fixTestFile(filePath) {
  console.log(`Fixing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 1: Add test.describe wrapper if missing
    if (!content.includes('test.describe(')) {
      const fileName = path.basename(filePath, '.spec.js');
      const testName = fileName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      content = `const { test, expect } = require('@playwright/test');\n\ntest.describe('${testName}', () => {\n${content}\n});`;
    }
    
    // Fix 2: Add async to test functions if missing
    content = content.replace(/test\(['"](.*?)['"]\s*,\s*\(\s*\{(.*?)\}\s*\)\s*=>/g, 
                             "test('$1', async ({ $2 }) =>");
    
    // Fix 3: Fix string template literals
    content = content.replace(/`\${process\.env\.PLAYWRIGHT_DOCS_URL}docs'https:\/`\/intro'/g, 
                             '`${process.env.PLAYWRIGHT_DOCS_URL}docs/intro`');
    
    // Fix 4: Fix extra closing braces
    content = content.replace(/\n}\n\n}\);/g, '\n  }\n});');
    
    // Fix 5: Fix missing catch blocks
    content = content.replace(/try\s*\{([\s\S]*?)(\n\s*}\);)/g, 
                             'try {$1\n  } catch (error) {\n    console.error(error);\n  }$2');
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
    return false;
  }
}

// Function to find and fix test files
function findAndFixTestFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findAndFixTestFiles(filePath);
    } else if (stat.isFile() && file.endsWith('.spec.js')) {
      fixTestFile(filePath);
    }
  }
}

// Main function
function main() {
  const testsDir = path.resolve(__dirname, 'src/tests');
  console.log('Starting to fix test files...');
  findAndFixTestFiles(testsDir);
  console.log('Fixes complete!');
}

// Run the script
main();