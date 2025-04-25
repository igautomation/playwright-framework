/**
 * Test data generator for Salesforce tests
 */

/**
 * Generate random contact data
 * @param {Object} overrides - Fields to override
 * @returns {Object} Contact data
 */
export function generateContactData(overrides = {}) {
  const timestamp = Date.now();
  const defaultData = {
    FirstName: `TestFN${timestamp}`,
    LastName: `TestLN${timestamp}`,
    Email: `test-${timestamp}@example.com`,
    Phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    Title: 'Test Contact',
    Department: 'QA'
  };
  
  return { ...defaultData, ...overrides };
}

/**
 * Generate random account data
 * @param {Object} overrides - Fields to override
 * @returns {Object} Account data
 */
export function generateAccountData(overrides = {}) {
  const timestamp = Date.now();
  const defaultData = {
    Name: `TestAccount${timestamp}`,
    Phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    Industry: 'Technology',
    Type: 'Customer',
    Website: `https://example-${timestamp}.com`
  };
  
  return { ...defaultData, ...overrides };
}

/**
 * Generate random opportunity data
 * @param {Object} overrides - Fields to override
 * @returns {Object} Opportunity data
 */
export function generateOpportunityData(overrides = {}) {
  const timestamp = Date.now();
  const defaultData = {
    Name: `TestOpp${timestamp}`,
    StageName: 'Prospecting',
    CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    Amount: Math.floor(1000 + Math.random() * 9000)
  };
  
  return { ...defaultData, ...overrides };
}

/**
 * Load test data from JSON file
 * @param {string} path - Path to JSON file
 * @returns {Promise<Object>} Test data
 */
export async function loadTestData(path) {
  try {
    const fs = await import('fs/promises');
    const data = await fs.readFile(path, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load test data from ${path}:`, error);
    throw error;
  }
}