// global-setup.js
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Global setup for all tests
 * - Ensures API headers are properly configured
 * - Sets up any required test data
 */
async function globalSetup(config) {
  console.log('Running global setup...');
  
  // Ensure the API headers are properly configured in testData.yaml
  try {
    const testDataPath = path.join(__dirname, 'src/data/testData.yaml');
    if (fs.existsSync(testDataPath)) {
      let content = fs.readFileSync(testDataPath, 'utf8');
      
      // Check if API headers section exists
      if (!content.includes('headers:') || !content.includes('x-api-key:')) {
        console.log('Adding API headers to testData.yaml...');
        
        // Find the api section
        const apiSectionIndex = content.indexOf('api:');
        if (apiSectionIndex !== -1) {
          // Find where to insert the headers
          const endpointsIndex = content.indexOf('endpoints:', apiSectionIndex);
          if (endpointsIndex !== -1) {
            // Insert headers before endpoints
            const beforeEndpoints = content.substring(0, endpointsIndex);
            const afterEndpoints = content.substring(endpointsIndex);
            content = beforeEndpoints + '  headers:\n    x-api-key: reqres-free-v1\n    content-type: application/json\n  ' + afterEndpoints;
          } else {
            // No endpoints section, add headers at the end of api section
            const lines = content.split('\n');
            let apiSectionLineIndex = -1;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].trim() === 'api:') {
                apiSectionLineIndex = i;
                break;
              }
            }
            
            if (apiSectionLineIndex !== -1) {
              // Find the indentation level of the api section
              const nextSectionIndex = lines.findIndex((line, index) => 
                index > apiSectionLineIndex && 
                line.trim().endsWith(':') && 
                !line.trim().startsWith(' ')
              );
              
              const insertIndex = nextSectionIndex !== -1 ? nextSectionIndex : lines.length;
              lines.splice(insertIndex, 0, '  headers:', '    x-api-key: reqres-free-v1', '    content-type: application/json');
              content = lines.join('\n');
            }
          }
          
          // Write the updated content back to the file
          fs.writeFileSync(testDataPath, content, 'utf8');
          console.log('API headers added to testData.yaml');
        }
      } else {
        console.log('API headers already exist in testData.yaml');
      }
    } else {
      console.warn('testData.yaml not found at', testDataPath);
    }
  } catch (error) {
    console.error('Error updating testData.yaml:', error);
  }
  
  console.log('Global setup complete');
}

module.exports = globalSetup;