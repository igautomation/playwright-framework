/**
 * Tests for Salesforce Page Generator
 */
const { test, expect } = require('@playwright/test');
const { 
  generatePageClass, 
  findElementsByType,
  getElementName,
  formatName,
  getElementSelector
} = require('../../src/utils/generators/sf-page-generator');

test.describe('Salesforce Page Generator', () => {
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
    
    const pageClass = await generatePageClass(elements, 'TestPage', '/test/url');
    
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
    
    const result = findElementsByType(elements, ['lightning-input', 'button']);
    
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('input1');
    expect(result[1].id).toBe('button1');
  });
  
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
      expect(getElementName(element)).toBe(expected);
    });
  });
  
  test('formatName should convert strings to camelCase', () => {
    const testCases = [
      { input: 'First Name', expected: 'firstName' },
      { input: 'LAST_NAME', expected: 'lastName' },
      { input: 'email-address', expected: 'emailAddress' },
      { input: 'Submit Button!', expected: 'submitButton' },
      { input: '  Trim  Spaces  ', expected: 'trimSpaces' }
    ];
    
    testCases.forEach(({ input, expected }) => {
      expect(formatName(input)).toBe(expected);
    });
  });
  
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
      expect(getElementSelector(element)).toBe(expected);
    });
  });
});