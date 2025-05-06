const axios = require('axios');

class XrayIntegration {
  constructor(jiraUrl, clientId, clientSecret) {
    this.jiraUrl = jiraUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.token = null;
  }

  async authenticate() {
    const response = await axios.post(
      `${this.jiraUrl}/rest/oauth2/latest/token`,
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }
    );
    this.token = response.data.access_token;
  }

  async fetchTestCases(testPlanId) {
    await this.authenticate();
    const response = await axios.get(
      `${this.jiraUrl}/rest/raven/1.0/api/testplan/${testPlanId}/test`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
    return response.data;
  }

  async reportResults(testExecutionId, results) {
    await this.authenticate();
    await axios.post(
      `${this.jiraUrl}/rest/raven/1.0/api/testexecution/${testExecutionId}/result`,
      results,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
  }
}

module.exports = XrayIntegration;
