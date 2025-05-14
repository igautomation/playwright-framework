/**
 * Script to identify and remove duplicate visual tests
 */
const fs = require('fs');
const path = require('path');

// Define the directories containing visual tests
const visualTestDirs = [
  path.join(__dirname, 'src/tests/visual'),
  path.join(__dirname, 'src/tests/ui/visual')
];

// Function to extract test names from a file
function extractTestNames(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const testRegex = /test\(['"](.*?)['"]/g;
  const matches = [];
  let match;
  
  while ((match = testRegex.exec(content)) !== null) {
    matches.push({
      name: match[1],
      file: filePath
    });
  }
  
  return matches;
}

// Function to check if two tests are duplicates
function areDuplicateTests(test1, test2) {
  // Simple check based on test name similarity
  // This could be enhanced with more sophisticated comparison
  const name1 = test1.name.toLowerCase();
  const name2 = test2.name.toLowerCase();
  
  // Check if the test names contain similar keywords
  const keywords = ['homepage', 'home page', 'main page'];
  
  for (const keyword of keywords) {
    if (name1.includes(keyword) && name2.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

// Main function to find and remove duplicates
async function removeDuplicateTests() {
  console.log('Scanning for duplicate visual tests...');
  
  // Collect all test files
  const testFiles = [];
  for (const dir of visualTestDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.spec.js') || file.endsWith('.test.js'))
        .map(file => path.join(dir, file));
      testFiles.push(...files);
    }
  }
  
  // Extract test names from all files
  const allTests = [];
  for (const file of testFiles) {
    const tests = extractTestNames(file);
    allTests.push(...tests);
  }
  
  // Find duplicates
  const duplicates = [];
  for (let i = 0; i < allTests.length; i++) {
    for (let j = i + 1; j < allTests.length; j++) {
      if (areDuplicateTests(allTests[i], allTests[j])) {
        duplicates.push({
          test1: allTests[i],
          test2: allTests[j]
        });
      }
    }
  }
  
  if (duplicates.length === 0) {
    console.log('No duplicate tests found.');
    return;
  }
  
  console.log(`Found ${duplicates.length} potential duplicate test pairs:`);
  
  // Group duplicates by file
  const filesToModify = new Map();
  
  for (const duplicate of duplicates) {
    console.log(`- "${duplicate.test1.name}" in ${path.basename(duplicate.test1.file)} and "${duplicate.test2.name}" in ${path.basename(duplicate.test2.file)}`);
    
    // Prefer keeping tests in src/tests/visual over src/tests/ui/visual
    const keepTest = duplicate.test1.file.includes('src/tests/visual') ? duplicate.test1 : duplicate.test2;
    const removeTest = keepTest === duplicate.test1 ? duplicate.test2 : duplicate.test1;
    
    if (!filesToModify.has(removeTest.file)) {
      filesToModify.set(removeTest.file, []);
    }
    filesToModify.get(removeTest.file).push(removeTest.name);
  }
  
  // Remove duplicate tests
  for (const [file, testsToRemove] of filesToModify.entries()) {
    console.log(`Modifying ${path.basename(file)} to remove ${testsToRemove.length} duplicate tests...`);
    
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    for (const testName of testsToRemove) {
      // Find the test block and remove it
      const testRegex = new RegExp(`test\\(['"](${testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})['"](.*?)\\);`, 'gs');
      const newContent = content.replace(testRegex, '// Duplicate test removed\n');
      
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`- Removed test "${testName}"`);
      }
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`Updated ${path.basename(file)}`);
    }
  }
  
  console.log('Duplicate test removal completed.');
}

// Run the function
removeDuplicateTests().catch(console.error);