/**
 * Xray Integration utilities
 */
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

/**
 * Get Jira/Xray auth token
 * @returns {Promise<string>} Auth token
 */
async function getJiraToken() {
  const username = process.env.JIRA_USERNAME;
  const apiToken = process.env.JIRA_API_TOKEN;
  
  if (!username || !apiToken) {
    throw new Error('Jira credentials missing in environment variables');
  }
  
  const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
  return `Basic ${auth}`;
}

/**
 * Get test cases from Xray
 * @param {string} jql - JQL query to filter test cases
 * @returns {Promise<Array>} Array of test cases
 */
export async function getXrayTestCases(jql = '') {
  const baseUrl = process.env.JIRA_BASE_URL;
  const projectKey = process.env.JIRA_PROJECT_KEY;
  
  if (!baseUrl || !projectKey) {
    throw new Error('Jira project configuration missing');
  }
  
  const defaultJql = jql || `project = ${projectKey} AND issuetype = "Test" AND status != "Obsolete"`;
  const url = `${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(defaultJql)}`;
  
  try {
    const authToken = await getJiraToken();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Jira API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.issues;
  } catch (error) {
    console.error('❌ Failed to fetch Xray test cases:', error);
    throw error;
  }
}

/**
 * Save test cases to local file system
 * @param {Array} testCases - Test cases from Xray
 */
export async function saveTestCasesToFile(testCases) {
  try {
    const outputDir = path.join(process.cwd(), 'data', 'xray');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputFile = path.join(outputDir, 'test-cases.json');
    await fs.writeFile(outputFile, JSON.stringify(testCases, null, 2));
    
    console.log(`✅ Saved ${testCases.length} test cases to ${outputFile}`);
  } catch (error) {
    console.error('❌ Failed to save test cases:', error);
    throw error;
  }
}

/**
 * Report test results back to Xray
 * @param {Object} results - Test execution results
 * @returns {Promise<void>}
 */
export async function reportResultsToXray(results) {
  const baseUrl = process.env.JIRA_BASE_URL;
  const projectKey = process.env.JIRA_PROJECT_KEY;
  
  if (!baseUrl || !projectKey) {
    throw new Error('Jira project configuration missing');
  }
  
  try {
    const authToken = await getJiraToken();
    const url = `${baseUrl}/rest/api/3/issue`;
    
    // Create Test Execution issue
    const executionResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          project: { key: projectKey },
          summary: `Test Execution - ${new Date().toISOString()}`,
          issuetype: { name: 'Test Execution' }
        }
      })
    });
    
    if (!executionResponse.ok) {
      throw new Error(`Failed to create Test Execution: ${executionResponse.statusText}`);
    }
    
    const executionData = await executionResponse.json();
    const executionId = executionData.id;
    
    // Add test results to execution
    const xrayApiUrl = `${baseUrl}/rest/raven/1.0/api/testexec/${executionId}/test`;
    
    const testResults = results.map(result => ({
      testKey: result.testKey,
      status: result.passed ? 'PASS' : 'FAIL',
      comment: result.message || ''
    }));
    
    const resultsResponse = await fetch(xrayApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testResults)
    });
    
    if (!resultsResponse.ok) {
      throw new Error(`Failed to add test results: ${resultsResponse.statusText}`);
    }
    
    console.log(`✅ Successfully reported test results to Xray - Execution ID: ${executionId}`);
  } catch (error) {
    console.error('❌ Failed to report results to Xray:', error);
    throw error;
  }
}