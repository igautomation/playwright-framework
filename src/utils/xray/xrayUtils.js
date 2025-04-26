// src/utils/xray/xrayUtils.js
const fetch = require('node-fetch');

/**
 * Pushes test results to Xray
 * @returns {Promise<void>}
 */
async function pushToXray() {
  const { JIRA_BASE_URL, JIRA_API_TOKEN, JIRA_USERNAME, TEST_EXECUTION_KEY } = process.env;
  if (!JIRA_BASE_URL || !JIRA_API_TOKEN || !JIRA_USERNAME || !TEST_EXECUTION_KEY) {
    throw new Error('Missing required environment variables for Xray integration');
  }
  const auth = Buffer.from(`${JIRA_USERNAME}:${JIRA_API_TOKEN}`).toString('base64');
  const response = await fetch(`${JIRA_BASE_URL}/api/v2/import/execution`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      testExecutionKey: TEST_EXECUTION_KEY,
      tests: [], // TODO: Populate with test results from allure-results
    }),
  });
  if (!response.ok) throw new Error(`Failed to push to Xray: ${response.statusText}`);
  console.log('Pushed results to Xray');
}

if (process.argv[2] === 'push-to-xray') {
  pushToXray().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { pushToXray };