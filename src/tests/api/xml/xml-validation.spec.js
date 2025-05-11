/**
 * XML API testing and validation
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

// Utility function to read XML data
function readXml(filePath) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  return parser.parse(fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8'));
}

// Utility function to convert JSON to XML
function jsonToXml(json) {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  return builder.build(json);
}

test.describe('XML API Tests @xml', () => {
  let xmlResponses;
  
  test.beforeAll(async () => {
    // Load XML test data
    xmlResponses = readXml('src/data/xml/api-responses.xml');
  });
  
  test('Mock XML API response and validate @xml', async ({ page }) => {
    // Get expected user data from XML file
    const getUserResponse = xmlResponses.apiResponses.response.find(
      r => r['@_id'] === 'getUserSuccess'
    );
    
    // Extract user data
    const userData = getUserResponse.body.user;
    
    // Set up mock API endpoint on the page
    await page.route('**/api/users/1', route => {
      // Convert the XML response to a string
      const xmlResponse = jsonToXml({
        user: userData
      });
      
      // Send the mocked XML response
      route.fulfill({
        status: 200,
        contentType: 'application/xml',
        body: xmlResponse
      });
    });
    
    // Create a simple page with XML API request
    await page.setContent(`
      <html>
        <head>
          <title>XML API Test</title>
        </head>
        <body>
          <h1>XML API Test</h1>
          <button id="fetch-user">Fetch User</button>
          <div id="user-data"></div>
          
          <script>
            document.getElementById('fetch-user').addEventListener('click', async () => {
              try {
                const response = await fetch('/api/users/1', {
                  headers: {
                    'Accept': 'application/xml'
                  }
                });
                
                const xmlText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                
                // Extract user data from XML
                const user = {
                  id: xmlDoc.querySelector('id').textContent,
                  firstName: xmlDoc.querySelector('firstName').textContent,
                  lastName: xmlDoc.querySelector('lastName').textContent,
                  email: xmlDoc.querySelector('email').textContent,
                  role: xmlDoc.querySelector('role').textContent
                };
                
                // Display user data
                const userDataElement = document.getElementById('user-data');
                userDataElement.innerHTML = \`
                  <div class="user-id">ID: \${user.id}</div>
                  <div class="user-name">Name: \${user.firstName} \${user.lastName}</div>
                  <div class="user-email">Email: \${user.email}</div>
                  <div class="user-role">Role: \${user.role}</div>
                \`;
              } catch (error) {
                console.error('Error fetching user:', error);
                document.getElementById('user-data').textContent = 'Error fetching user data';
              }
            });
          </script>
        </body>
      </html>
    `);
    
    // Click the button to fetch user data
    await page.click('#fetch-user');
    
    // Wait for the user data to be displayed
    await page.waitForSelector('#user-data .user-id');
    
    // Verify the user data matches the XML data
    await expect(page.locator('.user-id')).toHaveText(`ID: ${userData.id}`);
    await expect(page.locator('.user-name')).toHaveText(`Name: ${userData.firstName} ${userData.lastName}`);
    await expect(page.locator('.user-email')).toHaveText(`Email: ${userData.email}`);
    await expect(page.locator('.user-role')).toHaveText(`Role: ${userData.role}`);
  });
  
  test('Test XML error responses @xml', async ({ page }) => {
    // Get error response from XML file
    const errorResponse = xmlResponses.apiResponses.response.find(
      r => r['@_id'] === 'getUserNotFound'
    );
    
    // Extract error data
    const errorData = errorResponse.body.error;
    
    // Set up mock API endpoint on the page
    await page.route('**/api/users/999', route => {
      // Convert the XML response to a string
      const xmlResponse = jsonToXml({
        error: errorData
      });
      
      // Send the mocked XML response
      route.fulfill({
        status: 404,
        contentType: 'application/xml',
        body: xmlResponse
      });
    });
    
    // Create a simple page with XML API request
    await page.setContent(`
      <html>
        <head>
          <title>XML API Error Test</title>
          <style>
            .error {
              color: red;
              border: 1px solid red;
              padding: 10px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <h1>XML API Error Test</h1>
          <button id="fetch-user">Fetch Non-existent User</button>
          <div id="user-data"></div>
          
          <script>
            document.getElementById('fetch-user').addEventListener('click', async () => {
              try {
                const response = await fetch('/api/users/999', {
                  headers: {
                    'Accept': 'application/xml'
                  }
                });
                
                if (!response.ok) {
                  const xmlText = await response.text();
                  const parser = new DOMParser();
                  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                  
                  // Extract error data from XML
                  const error = {
                    code: xmlDoc.querySelector('code').textContent,
                    message: xmlDoc.querySelector('message').textContent
                  };
                  
                  // Display error data
                  const userDataElement = document.getElementById('user-data');
                  userDataElement.innerHTML = \`
                    <div class="error">
                      <div class="error-code">Error Code: \${error.code}</div>
                      <div class="error-message">Message: \${error.message}</div>
                    </div>
                  \`;
                }
              } catch (error) {
                console.error('Error fetching user:', error);
                document.getElementById('user-data').textContent = 'Error in API request';
              }
            });
          </script>
        </body>
      </html>
    `);
    
    // Click the button to fetch user data
    await page.click('#fetch-user');
    
    // Wait for the error to be displayed
    await page.waitForSelector('.error');
    
    // Verify the error data matches the XML data
    await expect(page.locator('.error-code')).toHaveText(`Error Code: ${errorData.code}`);
    await expect(page.locator('.error-message')).toHaveText(`Message: ${errorData.message}`);
  });
  
  test('Compare XML responses from different sources @xml', async ({ request }) => {
    // Get expected user data from XML file
    const createUserResponse = xmlResponses.apiResponses.response.find(
      r => r['@_id'] === 'createUserSuccess'
    );
    
    // Extract user data from XML
    const expectedUser = createUserResponse.body.user;
    
    // Make a real API request (to reqres.in which returns JSON)
    const response = await request.post('https://reqres.in/api/users', {
      data: {
        name: `${expectedUser.firstName} ${expectedUser.lastName}`,
        job: expectedUser.role
      }
    });
    
    expect(response.status()).toBe(201);
    const actualUser = await response.json();
    
    // Compare the actual response with the expected XML data
    // Note: The structures will be different, but we can compare some fields
    expect(actualUser.name).toBe(`${expectedUser.firstName} ${expectedUser.lastName}`);
    expect(actualUser.job).toBe(expectedUser.role);
    expect(actualUser.id).toBeDefined();
    expect(actualUser.createdAt).toBeDefined();
    
    console.log('Actual API response matches expected XML data structure');
  });
});