/**
 * Notification utilities for Slack and MS Teams
 */
import fetch from 'node-fetch';

/**
 * Send notification to Slack
 * @param {Object} testReport - Test execution report
 * @returns {Promise<void>}
 */
export async function sendSlackNotification(testReport) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('⚠️ Slack webhook URL not configured, skipping notification');
    return;
  }
  
  const { passed, failed, flaky, executionTime, environment } = testReport;
  const totalTests = passed + failed;
  const passRate = Math.round((passed / totalTests) * 100);
  
  const color = passRate >= 90 ? '#36a64f' : passRate >= 75 ? '#f2c744' : '#d00000';
  
  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Test Results: ${passRate}% Pass Rate`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Environment:*\n${environment || 'Not specified'}`
          },
          {
            type: 'mrkdwn',
            text: `*Duration:*\n${executionTime}s`
          },
          {
            type: 'mrkdwn',
            text: `*Passed:*\n${passed}`
          },
          {
            type: 'mrkdwn',
            text: `*Failed:*\n${failed}`
          }
        ]
      }
    ],
    attachments: [
      {
        color,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: flaky > 0 ? `⚠️ *${flaky} flaky tests detected*` : '✅ No flaky tests detected'
            }
          }
        ]
      }
    ]
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      throw new Error(`Slack API returned ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Successfully sent notification to Slack');
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error);
  }
}

/**
 * Send notification to MS Teams
 * @param {Object} testReport - Test execution report
 * @returns {Promise<void>}
 */
export async function sendTeamsNotification(testReport) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('⚠️ Teams webhook URL not configured, skipping notification');
    return;
  }
  
  const { passed, failed, flaky, executionTime, environment, reportUrl } = testReport;
  const totalTests = passed + failed;
  const passRate = Math.round((passed / totalTests) * 100);
  
  const color = passRate >= 90 ? '36a64f' : passRate >= 75 ? 'f2c744' : 'd00000';
  
  const message = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": color,
    "summary": `Test Results: ${passRate}% Pass Rate`,
    "sections": [
      {
        "activityTitle": "Salesforce Test Automation Results",
        "activitySubtitle": `Environment: ${environment || 'Not specified'}`,
        "facts": [
          { "name": "Pass Rate", "value": `${passRate}%` },
          { "name": "Passed Tests", "value": passed.toString() },
          { "name": "Failed Tests", "value": failed.toString() },
          { "name": "Flaky Tests", "value": flaky.toString() },
          { "name": "Duration", "value": `${executionTime}s` }
        ],
        "markdown": true
      }
    ]
  };
  
  if (reportUrl) {
    message.potentialAction = [
      {
        "@type": "OpenUri",
        "name": "View Report",
        "targets": [{ "os": "default", "uri": reportUrl }]
      }
    ];
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      throw new Error(`Teams API returned ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Successfully sent notification to MS Teams');
  } catch (error) {
    console.error('❌ Failed to send MS Teams notification:', error);
  }
}