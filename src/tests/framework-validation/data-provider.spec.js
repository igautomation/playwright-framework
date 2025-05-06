const { test, expect } = require('@playwright/test');
const DataProvider = require('../../utils/web/dataProvider');
const fs = require('fs');
const path = require('path');

test.describe('Data Provider @validation', () => {
  let dataProvider;
  let testDataDir;
  
  test.beforeEach(() => {
    testDataDir = path.resolve(process.cwd(), 'data/extracted/test');
    dataProvider = new DataProvider({ dataDir: testDataDir });
    
    // Clean up test directory if it exists
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });
  
  test.afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  test('should save and load JSON data', async () => {
    const testData = {
      name: 'Test Product',
      price: 99.99,
      features: ['Feature 1', 'Feature 2'],
      details: {
        sku: 'SKU123',
        weight: '2kg'
      }
    };
    
    const filepath = dataProvider.saveAsJson(testData, 'test-product');
    expect(fs.existsSync(filepath)).toBeTruthy();
    
    const loadedData = dataProvider.loadFromJson('test-product');
    expect(loadedData).toEqual(testData);
  });

  test('should save and load CSV data', async () => {
    const testData = [
      { name: 'Product 1', price: '99.99', category: 'Electronics' },
      { name: 'Product 2', price: '49.99', category: 'Books' },
      { name: 'Product 3', price: '149.99', category: 'Furniture' }
    ];
    
    const filepath = dataProvider.saveAsCsv(testData, 'test-products');
    expect(fs.existsSync(filepath)).toBeTruthy();
    
    const loadedData = dataProvider.loadFromCsv('test-products');
    expect(loadedData).toHaveLength(3);
    expect(loadedData[0].name).toBe('Product 1');
    expect(loadedData[1].price).toBe('49.99');
    expect(loadedData[2].category).toBe('Furniture');
  });

  test('should handle CSV data with commas and quotes', async () => {
    const testData = [
      { name: 'Product, with comma', description: 'Description with "quotes"', price: '99.99' },
      { name: 'Another "quoted" product', description: 'Multiple, commas, here', price: '49.99' }
    ];
    
    const filepath = dataProvider.saveAsCsv(testData, 'test-complex-csv');
    expect(fs.existsSync(filepath)).toBeTruthy();
    
    const loadedData = dataProvider.loadFromCsv('test-complex-csv');
    expect(loadedData).toHaveLength(2);
    expect(loadedData[0].name).toBe('Product, with comma');
    expect(loadedData[0].description).toBe('Description with "quotes"');
    expect(loadedData[1].name).toBe('Another "quoted" product');
  });

  test('should save data based on file extension', async () => {
    const jsonData = { name: 'Test', value: 123 };
    const csvData = [
      { name: 'Row 1', value: '123' },
      { name: 'Row 2', value: '456' }
    ];
    
    const jsonPath = dataProvider.saveData(jsonData, 'auto-test.json');
    const csvPath = dataProvider.saveData(csvData, 'auto-test.csv');
    
    expect(fs.existsSync(jsonPath)).toBeTruthy();
    expect(fs.existsSync(csvPath)).toBeTruthy();
    
    const loadedJson = dataProvider.loadData('auto-test.json');
    const loadedCsv = dataProvider.loadData('auto-test.csv');
    
    expect(loadedJson).toEqual(jsonData);
    expect(loadedCsv).toHaveLength(2);
  });

  test('should merge multiple data files', async () => {
    // Create test files
    const data1 = [{ id: 1, name: 'Item 1' }];
    const data2 = [{ id: 2, name: 'Item 2' }];
    
    dataProvider.saveAsCsv(data1, 'merge-source-1');
    dataProvider.saveAsCsv(data2, 'merge-source-2');
    
    const mergedPath = dataProvider.mergeDataFiles(
      ['merge-source-1.csv', 'merge-source-2.csv'],
      'merged-result.csv'
    );
    
    expect(fs.existsSync(mergedPath)).toBeTruthy();
    
    const mergedData = dataProvider.loadFromCsv('merged-result');
    expect(mergedData).toHaveLength(2);
    expect(mergedData[0].id).toBe('1');
    expect(mergedData[1].id).toBe('2');
  });

  test('should list data files', async () => {
    // Create test files
    dataProvider.saveAsJson({ test: 'data' }, 'list-test-1');
    dataProvider.saveAsJson({ test: 'data2' }, 'list-test-2');
    dataProvider.saveAsCsv([{ test: 'row' }], 'list-test-3');
    
    const allFiles = dataProvider.listDataFiles();
    expect(allFiles.length).toBe(3);
    
    const jsonFiles = dataProvider.listDataFiles('json');
    expect(jsonFiles.length).toBe(2);
    
    const csvFiles = dataProvider.listDataFiles('csv');
    expect(csvFiles.length).toBe(1);
  });
});