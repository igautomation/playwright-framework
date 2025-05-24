/**
 * Tests for Salesforce Page Generator
 */
const { expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Import the module directly
const sfPageGenerator = require('../../src/utils/generators/sf-page-generator');

// Simple test runner
async function runTests() {
  const tests = [];
  let passed = 0;
  let failed = 0;
  
  function test(name, fn) {
    tests.push({ name, fn });
  }
  
  // Test: Generate page class
  test('should generate a valid page class from elements', async () => {
    // Mock elements data
    const elements = {
      'lightning-input': [
        {
          tagName: 'lightning-input',
          attributes: { label: 'First Name', 'field-name': 'FirstName' },
          visible: true
        },
        {
          tagName: 'lightning-input',
          attributes: { label: 'Last Name', 'field-name': 'LastName' },
          visible: true
        }
      ],
      'button': [
        {
          tagName: 'button',
          text: 'Save',
          attributes: { name: 'SaveEdit' },
          visible: true
        }
      ]
    };
    
    const pageClass = await sfPageGenerator.generatePageClass(elements, 'TestPage', '/test/url');
    
    // Verify the generated class has expected content
    expect(pageClass).toContain('class TestPage extends BasePage');
    expect(pageClass).toContain('this.url = \'/test/url\'');
    expect(pageClass).toContain('this.firstNameInput');
    expect(pageClass).toContain('this.lastNameInput');
    expect(pageClass).toContain('this.saveButton');
    expect(pageClass).toContain('async fillFirstName(value)');
    expect(pageClass).toContain('async fillLastName(value)');
    expect(pageClass).toContain('async clickSave()');
  });
  
  // Test: Find elements by type
  test('findElementsByType should filter elements by type', () => {
    const elements = {
      'lightning-input': [
        { tagName: 'lightning-input', visible: true, id: 'input1' },
        { tagName: 'lightning-input', visible: false, id: 'input2' }
      ],
      'button': [
        { tagName: 'button', visible: true, id: 'button1' }
      ],
      'div': [
        { tagName: 'div', visible: true, id: 'div1' }
      ]
    };
    
    const result = sfPageGenerator.findElementsByType(elements, ['lightning-input', 'button']);
    
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('input1');
    expect(result[1].id).toBe('button1');
  });
  
  // Test: Get element name
  test('getElementName should extract name from element attributes', () => {
    const testCases = [
      {
        element: { attributes: { label: 'First Name' } },
        expected: 'firstName'
      },
      {
        element: { attributes: { 'aria-label': 'Last Name' } },
        expected: 'lastName'
      },
      {
        element: { attributes: { placeholder: 'Enter Email' } },
        expected: 'enterEmail'
      },
      {
        element: { text: 'Save Record' },
        expected: 'saveRecord'
      },
      {
        element: { attributes: { 'field-name': 'AccountName' } },
        expected: 'accountName'
      },
      {
        element: { id: 'submit-button' },
        expected: 'submitButton'
      }
    ];
    
    testCases.forEach(({ element, expected }) => {
      expect(sfPageGenerator.getElementName(element)).toBe(expected);
    });
  });
  
  // Test: Format name
  test('formatName should convert strings to camelCase', () => {
    const testCases = [
      { input: 'First Name', expected: 'firstName' },
      { input: 'last_name', expected: 'lastName' },
      { input: 'email-address', expected: 'emailAddress' },
      { input: 'Submit Button!', expected: 'submitButton' },
      { input: '  Trim  Spaces  ', expected: 'trimSpaces' }
    ];
    
    testCases.forEach(({ input, expected }) => {
      expect(sfPageGenerator.formatName(input)).toBe(expected);
    });
  });
  
  // Test: Get element selector
  test('getElementSelector should return the best selector', () => {
    const testCases = [
      {
        element: { attributes: { 'data-testid': 'first-name' } },
        expected: '[data-testid="first-name"]'
      },
      {
        element: { id: 'lastName' },
        expected: '#lastName'
      },
      {
        element: { 
          tagName: 'lightning-input',
          attributes: { label: 'Email' }
        },
        expected: 'lightning-input[label="Email"]'
      },
      {
        element: { attributes: { name: 'phone' } },
        expected: '[name="phone"]'
      },
      {
        element: { 
          tagName: 'button',
          text: 'Save',
          attributes: { role: 'button' }
        },
        expected: 'button:has-text("Save")'
      }
    ];
    
    testCases.forEach(({ element, expected }) => {
      expect(sfPageGenerator.getElementSelector(element)).toBe(expected);
    });
  });
  
  // Run all tests
  console.log('Running tests...');
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (error) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});