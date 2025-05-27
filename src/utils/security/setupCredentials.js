/**
 * Setup Credentials
 * 
 * Utility to set up secure credentials for tests
 */
const CredentialManager = require('./credentialManager');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Initialize credential manager
const credentialManager = new CredentialManager();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for credentials
function promptForCredentials() {
  console.log('\n=== Playwright Framework Credential Setup ===\n');
  console.log('This utility will help you securely store credentials for your tests.');
  console.log('Credentials will be encrypted and stored in ~/.playwright-secrets\n');
  
  rl.question('Do you want to set up OrangeHRM credentials? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      setupOrangeHRMCredentials();
    } else {
      promptForSalesforceCredentials();
    }
  });
}

// Set up OrangeHRM credentials
function setupOrangeHRMCredentials() {
  rl.question('OrangeHRM Username [Admin]: ', (username) => {
    const orangeUsername = username || 'Admin';
    
    rl.question('OrangeHRM Password: ', (password) => {
      if (password) {
        credentialManager.storeCredential('ORANGE_HRM_USERNAME', orangeUsername);
        credentialManager.storeCredential('ORANGE_HRM_PASSWORD', password);
        console.log('OrangeHRM credentials stored successfully.');
      } else {
        console.log('Password cannot be empty. OrangeHRM credentials not stored.');
      }
      
      promptForSalesforceCredentials();
    });
  });
}

// Set up Salesforce credentials
function promptForSalesforceCredentials() {
  rl.question('Do you want to set up Salesforce credentials? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      setupSalesforceCredentials();
    } else {
      promptForReqresCredentials();
    }
  });
}

// Set up Salesforce credentials
function setupSalesforceCredentials() {
  rl.question('Salesforce Username: ', (username) => {
    if (username) {
      rl.question('Salesforce Password: ', (password) => {
        if (password) {
          credentialManager.storeCredential('SALESFORCE_USERNAME', username);
          credentialManager.storeCredential('SALESFORCE_PASSWORD', password);
          console.log('Salesforce credentials stored successfully.');
        } else {
          console.log('Password cannot be empty. Salesforce credentials not stored.');
        }
        
        promptForReqresCredentials();
      });
    } else {
      console.log('Username cannot be empty. Salesforce credentials not stored.');
      promptForReqresCredentials();
    }
  });
}

// Set up Reqres API credentials
function promptForReqresCredentials() {
  rl.question('Do you want to set up Reqres API key? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      setupReqresCredentials();
    } else {
      finishSetup();
    }
  });
}

// Set up Reqres API credentials
function setupReqresCredentials() {
  rl.question('Reqres API Key [reqres-free-v1]: ', (apiKey) => {
    const reqresApiKey = apiKey || 'reqres-free-v1';
    credentialManager.storeCredential('REQRES_API_KEY', reqresApiKey);
    console.log('Reqres API key stored successfully.');
    
    finishSetup();
  });
}

// Finish setup
function finishSetup() {
  console.log('\nCredential setup complete!');
  console.log('You can run this utility again at any time to update credentials.');
  console.log('Credentials are stored in: ~/.playwright-secrets\n');
  
  rl.close();
}

// Run the setup if this script is executed directly
if (require.main === module) {
  promptForCredentials();
}

module.exports = {
  setupCredentials: promptForCredentials
};