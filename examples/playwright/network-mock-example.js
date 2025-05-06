/**
 * Example demonstrating how to use PlaywrightService for network mocking
 */
const path = require('path');
const fs = require('fs');
const { PlaywrightService } = require('../../src/utils/common');

// Create output directory for examples
const outputDir = path.join(__dirname, 'output');

// Create a simple HTML file that makes API requests
function createApiTestHtml() {
  const htmlPath = path.join(outputDir, 'api-test.html');
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>API Test Page</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        button { padding: 10px; margin: 10px 0; }
        #results { 
          border: 1px solid #ddd; 
          padding: 10px; 
          margin-top: 20px;
          min-height: 200px;
          white-space: pre-wrap;
        }
        .error { color: red; }
        .success { color: green; }
      </style>
    </head>
    <body>
      <h1>API Test Page</h1>
      
      <button id="fetchDataBtn">Fetch Data</button>
      <button id="fetchErrorBtn">Fetch Error</button>
      <button id="fetchDelayedBtn">Fetch Delayed Response</button>
      
      <div id="results">Results will appear here...</div>
      
      <script>
        document.getElementById('fetchDataBtn').addEventListener('click', async () => {
          const results = document.getElementById('results');
          results.innerHTML = 'Loading...';
          results.className = '';
          
          try {
            const response = await fetch('/api/data');
            const data = await response.json();
            
            results.innerHTML = JSON.stringify(data, null, 2);
            results.className = 'success';
          } catch (error) {
            results.innerHTML = 'Error: ' + error.message;
            results.className = 'error';
          }
        });
        
        document.getElementById('fetchErrorBtn').addEventListener('click', async () => {
          const results = document.getElementById('results');
          results.innerHTML = 'Loading...';
          results.className = '';
          
          try {
            const response = await fetch('/api/error');
            
            if (!response.ok) {
              throw new Error('API returned ' + response.status);
            }
            
            const data = await response.json();
            results.innerHTML = JSON.stringify(data, null, 2);
            results.className = 'success';
          } catch (error) {
            results.innerHTML = 'Error: ' + error.message;
            results.className = 'error';
          }
        });
        
        document.getElementById('fetchDelayedBtn').addEventListener('click', async () => {
          const results = document.getElementById('results');
          results.innerHTML = 'Loading...';
          results.className = '';
          
          try {
            const response = await fetch('/api/delayed');
            const data = await response.json();
            
            results.innerHTML = JSON.stringify(data, null, 2);
            results.className = 'success';
          } catch (error) {
            results.innerHTML = 'Error: ' + error.message;
            results.className = 'error';
          }
        });
      </script>
    </body>
    </html>
  `;
  
  fs.writeFileSync(htmlPath, html);
  return htmlPath;
}

async function runNetworkMockExamples() {
  console.log('Running Playwright network mocking examples...');
  
  // Initialize PlaywrightService
  const playwrightService = new PlaywrightService({
    outputDir
  });
  
  try {
    // Create test HTML file
    const testHtmlPath = createApiTestHtml();
    const testHtmlUrl = `file://${testHtmlPath}`;
    
    // Example 1: Mock successful API response
    console.log('Example 1: Mocking successful API response...');
    const successResult = await playwrightService.withNetworkMocks(
      testHtmlUrl,
      [
        {
          url: '**/api/data',
          body: {
            success: true,
            data: {
              id: 123,
              name: 'Test Product',
              price: 99.99,
              features: ['Feature 1', 'Feature 2', 'Feature 3']
            },
            timestamp: new Date().toISOString()
          },
          contentType: 'application/json'
        }
      ],
      async (page) => {
        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');
        
        // Click the fetch data button
        await page.click('#fetchDataBtn');
        
        // Wait for results to appear
        await page.waitForFunction(() => {
          const results = document.getElementById('results');
          return results.textContent !== 'Loading...';
        });
        
        // Get the results text
        const resultsText = await page.$eval('#results', el => el.textContent);
        
        // Take a screenshot
        await page.screenshot({ path: path.join(outputDir, 'mock-success.png') });
        
        return { resultsText };
      },
      { screenshot: true }
    );
    
    console.log('Success mock results:', successResult.result);
    console.log(`Screenshot saved to: ${successResult.screenshotPath}`);
    
    // Example 2: Mock API error
    console.log('\nExample 2: Mocking API error...');
    const errorResult = await playwrightService.withNetworkMocks(
      testHtmlUrl,
      [
        {
          url: '**/api/error',
          status: 500,
          body: {
            error: 'Internal Server Error',
            message: 'Something went wrong',
            code: 'SERVER_ERROR'
          },
          contentType: 'application/json'
        }
      ],
      async (page) => {
        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');
        
        // Click the fetch error button
        await page.click('#fetchErrorBtn');
        
        // Wait for results to appear
        await page.waitForFunction(() => {
          const results = document.getElementById('results');
          return results.textContent !== 'Loading...';
        });
        
        // Get the results text
        const resultsText = await page.$eval('#results', el => el.textContent);
        const resultsClass = await page.$eval('#results', el => el.className);
        
        // Take a screenshot
        await page.screenshot({ path: path.join(outputDir, 'mock-error.png') });
        
        return { resultsText, resultsClass };
      },
      { screenshot: true }
    );
    
    console.log('Error mock results:', errorResult.result);
    console.log(`Screenshot saved to: ${errorResult.screenshotPath}`);
    
    // Example 3: Mock delayed API response
    console.log('\nExample 3: Mocking delayed API response...');
    const delayedResult = await playwrightService.withNetworkMocks(
      testHtmlUrl,
      [
        {
          url: '**/api/delayed',
          body: {
            success: true,
            data: {
              message: 'This response was delayed',
              timestamp: new Date().toISOString()
            }
          },
          delay: 2000, // 2 second delay
          contentType: 'application/json'
        }
      ],
      async (page) => {
        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');
        
        // Click the fetch delayed button
        await page.click('#fetchDelayedBtn');
        
        // Take a screenshot while loading
        await page.screenshot({ path: path.join(outputDir, 'mock-delayed-loading.png') });
        
        // Wait for results to appear
        await page.waitForFunction(() => {
          const results = document.getElementById('results');
          return results.textContent !== 'Loading...';
        }, { timeout: 5000 });
        
        // Get the results text
        const resultsText = await page.$eval('#results', el => el.textContent);
        
        // Take a screenshot after loading
        await page.screenshot({ path: path.join(outputDir, 'mock-delayed-loaded.png') });
        
        return { resultsText };
      },
      { screenshot: true }
    );
    
    console.log('Delayed mock results:', delayedResult.result);
    console.log(`Screenshot saved to: ${delayedResult.screenshotPath}`);
    
    console.log('\nAll network mocking examples completed successfully!');
  } catch (error) {
    console.error('Error running network mocking examples:', error);
  }
}

// Run the examples
runNetworkMockExamples().catch(console.error);