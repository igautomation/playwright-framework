/**
 * Test fixtures for data provider tests
 */

const testJsonData = {
  name: 'Test Product',
  price: 99.99,
  features: ['Feature 1', 'Feature 2'],
  details: {
    sku: 'SKU123',
    weight: '2kg'
  }
};

const testCsvData = [
  { name: 'Product 1', price: '99.99', category: 'Electronics' },
  { name: 'Product 2', price: '49.99', category: 'Books' },
  { name: 'Product 3', price: '149.99', category: 'Furniture' }
];

const testComplexCsvData = [
  { name: 'Product, with comma', description: 'Description with "quotes"', price: '99.99' },
  { name: 'Another "quoted" product', description: 'Multiple, commas, here', price: '49.99' }
];

const testAutoJsonData = { name: 'Test', value: 123 };

const testAutoCsvData = [
  { name: 'Row 1', value: '123' },
  { name: 'Row 2', value: '456' }
];

const testMergeData1 = [{ id: 1, name: 'Item 1' }];
const testMergeData2 = [{ id: 2, name: 'Item 2' }];

module.exports = {
  testJsonData,
  testCsvData,
  testComplexCsvData,
  testAutoJsonData,
  testAutoCsvData,
  testMergeData1,
  testMergeData2
};