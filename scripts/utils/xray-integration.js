/**
 * Xray integration utilities for CLI
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get Xray authentication token
 * @returns {Promise<string>} Authentication token
 */
async function getXrayToken() {
  const clientId = process.env.XRAY_CLIENT_ID;
  const clientSecret = process.env.XRAY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('XRAY_CLIENT_ID and XRAY_CLIENT_SECRET environment variables must be set');
  }
  
  try {
    const response = await fetch('https://xray.cloud.getxray.app/api/v2/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to authenticate: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Failed to get Xray token:', error);
    throw error;
  }
}

/**
 * Get test cases from Xray
 * @param {string} jql - JQL query to filter test cases
 * @returns {Promise<Array>} Test cases
 */
export async function getXrayTestCases(jql = '') {
  try {
    const token = await getXrayToken();
    
    const query = jql || 'project = TEST AND issuetype = "Test" AND status != Done';
    
    const response = await fetch('https://xray.cloud.getxray.app/api/v2/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          query {
            getTests(jql: "${query}") {
              total
              results {
                issueId
                key
                summary
                description
                status
                testType {
                  name
                }
                steps {
                  id
                  data
                  result
                }
              }
            }
          }
        `
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get test cases: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }
    
    return data.data.getTests.results;
  } catch (error) {
    console.error('Failed to get test cases from Xray:', error);
    throw error;
  }
}

/**
 * Save test cases to file
 * @param {Array} testCases - Test cases to save
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} Path to saved file
 */
export async function saveTestCasesToFile(testCases, outputPath) {
  try {
    const filePath = outputPath || path.resolve(process.cwd(), 'data/xray-test-cases.json');
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write test cases to file
    await fs.writeFile(filePath, JSON.stringify(testCases, null, 2));
    
    console.log(`Saved ${testCases.length} test cases to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Failed to save test cases to file:', error);
    throw error;
  }
}

/**
 * Generate test files from Xray test cases
 * @param {Array} testCases - Test cases to generate files for
 * @param {string} outputDir - Output directory
 * @returns {Promise<Array>} Generated file paths
 */
export async function generateTestFiles(testCases, outputDir) {
  try {
    const dir = outputDir || path.resolve(process.cwd(), 'src/tests/xray');
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    const generatedFiles = [];
    
    for (const testCase of testCases) {
      const fileName = `${testCase.key.toLowerCase().replace(/[^a-z0-9]/g, '-')}.spec.js`;
      const filePath = path.join(dir, fileName);
      
      const testContent = `
/**
 * Auto-generated test from Xray test case ${testCase.key}
 * Summary: ${testCase.summary}
 */
import { test, expect } from '@playwright/test';

test('${testCase.key} - ${testCase.summary}', async ({ page }) => {
  // TODO: Implement test steps
  // Description: ${testCase.description ? testCase.description.replace(/\n/g, '\n  // ') : 'No description'}
  
  // This is a placeholder implementation
  await page.goto('about:blank');
  expect(true).toBeTruthy();
});
`;
      
      await fs.writeFile(filePath, testContent);
      generatedFiles.push(filePath);
    }
    
    console.log(`Generated ${generatedFiles.length} test files in ${dir}`);
    return generatedFiles;
  } catch (error) {
    console.error('Failed to generate test files:', error);
    throw error;
  }
}

export default {
  getXrayToken,
  getXrayTestCases,
  saveTestCasesToFile,
  generateTestFiles
};