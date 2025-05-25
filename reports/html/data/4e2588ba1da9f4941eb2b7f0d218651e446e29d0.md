# Test info

- Name: Salesforce Page Generator >> formatName should convert strings to camelCase
- Location: /Users/mzahirudeen/playwright-framework/tests/generators/sf-page-generator.test.js:106:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "lastName"
Received: "lAST_NAME"
    at forEach (/Users/mzahirudeen/playwright-framework/tests/generators/sf-page-generator.test.js:116:33)
    at /Users/mzahirudeen/playwright-framework/tests/generators/sf-page-generator.test.js:115:15
```

# Test source

```ts
   16 |     const elements = {
   17 |       'lightning-input': [
   18 |         {
   19 |           tagName: 'lightning-input',
   20 |           attributes: { label: 'First Name', 'field-name': 'FirstName' },
   21 |           visible: true
   22 |         },
   23 |         {
   24 |           tagName: 'lightning-input',
   25 |           attributes: { label: 'Last Name', 'field-name': 'LastName' },
   26 |           visible: true
   27 |         }
   28 |       ],
   29 |       'button': [
   30 |         {
   31 |           tagName: 'button',
   32 |           text: 'Save',
   33 |           attributes: { name: 'SaveEdit' },
   34 |           visible: true
   35 |         }
   36 |       ]
   37 |     };
   38 |     
   39 |     const pageClass = await generatePageClass(elements, 'TestPage', '/test/url');
   40 |     
   41 |     // Verify the generated class has expected content
   42 |     expect(pageClass).toContain('class TestPage extends BasePage');
   43 |     expect(pageClass).toContain('this.url = \'/test/url\'');
   44 |     expect(pageClass).toContain('this.firstNameInput');
   45 |     expect(pageClass).toContain('this.lastNameInput');
   46 |     expect(pageClass).toContain('this.saveButton');
   47 |     expect(pageClass).toContain('async fillFirstName(value)');
   48 |     expect(pageClass).toContain('async fillLastName(value)');
   49 |     expect(pageClass).toContain('async clickSave()');
   50 |   });
   51 |   
   52 |   test('findElementsByType should filter elements by type', () => {
   53 |     const elements = {
   54 |       'lightning-input': [
   55 |         { tagName: 'lightning-input', visible: true, id: 'input1' },
   56 |         { tagName: 'lightning-input', visible: false, id: 'input2' }
   57 |       ],
   58 |       'button': [
   59 |         { tagName: 'button', visible: true, id: 'button1' }
   60 |       ],
   61 |       'div': [
   62 |         { tagName: 'div', visible: true, id: 'div1' }
   63 |       ]
   64 |     };
   65 |     
   66 |     const result = findElementsByType(elements, ['lightning-input', 'button']);
   67 |     
   68 |     expect(result).toHaveLength(2);
   69 |     expect(result[0].id).toBe('input1');
   70 |     expect(result[1].id).toBe('button1');
   71 |   });
   72 |   
   73 |   test('getElementName should extract name from element attributes', () => {
   74 |     const testCases = [
   75 |       {
   76 |         element: { attributes: { label: 'First Name' } },
   77 |         expected: 'firstName'
   78 |       },
   79 |       {
   80 |         element: { attributes: { 'aria-label': 'Last Name' } },
   81 |         expected: 'lastName'
   82 |       },
   83 |       {
   84 |         element: { attributes: { placeholder: 'Enter Email' } },
   85 |         expected: 'enterEmail'
   86 |       },
   87 |       {
   88 |         element: { text: 'Save Record' },
   89 |         expected: 'saveRecord'
   90 |       },
   91 |       {
   92 |         element: { attributes: { 'field-name': 'AccountName' } },
   93 |         expected: 'accountName'
   94 |       },
   95 |       {
   96 |         element: { id: 'submit-button' },
   97 |         expected: 'submitButton'
   98 |       }
   99 |     ];
  100 |     
  101 |     testCases.forEach(({ element, expected }) => {
  102 |       expect(getElementName(element)).toBe(expected);
  103 |     });
  104 |   });
  105 |   
  106 |   test('formatName should convert strings to camelCase', () => {
  107 |     const testCases = [
  108 |       { input: 'First Name', expected: 'firstName' },
  109 |       { input: 'LAST_NAME', expected: 'lastName' },
  110 |       { input: 'email-address', expected: 'emailAddress' },
  111 |       { input: 'Submit Button!', expected: 'submitButton' },
  112 |       { input: '  Trim  Spaces  ', expected: 'trimSpaces' }
  113 |     ];
  114 |     
  115 |     testCases.forEach(({ input, expected }) => {
> 116 |       expect(formatName(input)).toBe(expected);
      |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  117 |     });
  118 |   });
  119 |   
  120 |   test('getElementSelector should return the best selector', () => {
  121 |     const testCases = [
  122 |       {
  123 |         element: { attributes: { 'data-testid': 'first-name' } },
  124 |         expected: '[data-testid="first-name"]'
  125 |       },
  126 |       {
  127 |         element: { id: 'lastName' },
  128 |         expected: '#lastName'
  129 |       },
  130 |       {
  131 |         element: { 
  132 |           tagName: 'lightning-input',
  133 |           attributes: { label: 'Email' }
  134 |         },
  135 |         expected: 'lightning-input[label="Email"]'
  136 |       },
  137 |       {
  138 |         element: { attributes: { name: 'phone' } },
  139 |         expected: '[name="phone"]'
  140 |       },
  141 |       {
  142 |         element: { 
  143 |           tagName: 'button',
  144 |           text: 'Save',
  145 |           attributes: { role: 'button' }
  146 |         },
  147 |         expected: 'button:has-text("Save")'
  148 |       }
  149 |     ];
  150 |     
  151 |     testCases.forEach(({ element, expected }) => {
  152 |       expect(getElementSelector(element)).toBe(expected);
  153 |     });
  154 |   });
  155 | });
```