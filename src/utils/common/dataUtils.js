/**
 * Data Utilities
 * 
 * Provides functions for reading and parsing data from various file formats
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// In-memory cache to avoid redundant file reads
const cache = new Map();

/**
 * Read and parse data from a file
 * @param {string} filePath - Path to the data file
 * @param {Object} options - Options for reading data
 * @param {boolean} options.cache - Whether to cache the result (default: true)
 * @param {boolean} options.validate - Whether to validate the data (default: true)
 * @returns {Promise<any>} Parsed data
 */
async function readData(filePath, options = {}) {
  const { cache: useCache = true, validate = true } = options;
  
  try {
    // Return cached data if available and caching is enabled
    if (useCache && cache.has(filePath)) {
      return cache.get(filePath);
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse data based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let data;
    
    switch (ext) {
      case '.json':
        data = JSON.parse(content);
        break;
        
      case '.yaml':
      case '.yml':
        data = yaml.load(content);
        break;
        
      case '.csv':
        data = parseCSV(content, filePath, validate);
        break;
        
      case '.xml':
        data = parseXML(content, filePath, validate);
        break;
        
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
    
    // Cache the result if caching is enabled
    if (useCache) {
      cache.set(filePath, data);
    }
    
    return data;
  } catch (error) {
    throw new Error(`Failed to read data from ${filePath}: ${error.message}`);
  }
}

/**
 * Read and parse JSON data from a file
 * @param {string} filePath - Path to the JSON file
 * @param {Object} options - Options for reading data
 * @returns {Promise<any>} Parsed JSON data
 */
async function readJsonData(filePath, options = {}) {
  return readData(filePath, { ...options, validate: false });
}

/**
 * Read and parse YAML data from a file
 * @param {string} filePath - Path to the YAML file
 * @param {Object} options - Options for reading data
 * @returns {Promise<any>} Parsed YAML data
 */
async function readYamlData(filePath, options = {}) {
  return readData(filePath, { ...options, validate: false });
}

/**
 * Read and parse CSV data from a file
 * @param {string} filePath - Path to the CSV file
 * @param {Object} options - Options for reading data
 * @returns {Promise<Array<Object>>} Parsed CSV data as array of objects
 */
async function readCsvData(filePath, options = {}) {
  return readData(filePath, { ...options, validate: true });
}

/**
 * Parse CSV content
 * @param {string} content - CSV content
 * @param {string} filePath - Path to the CSV file (for error messages)
 * @param {boolean} validate - Whether to validate the data
 * @returns {Array<Object>} Parsed CSV data as array of objects
 * @private
 */
function parseCSV(content, filePath, validate) {
  // Simple CSV parser
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error(`CSV file is empty: ${filePath}`);
  }
  
  // Parse headers
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Validate headers if needed
  if (validate) {
    validateCSVHeaders(headers, filePath);
  }
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

/**
 * Parse a CSV line, handling quoted values
 * @param {string} line - CSV line
 * @returns {Array<string>} Array of values
 * @private
 */
function parseCSVLine(line) {
  const values = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes
        currentValue += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      // Add character to current value
      currentValue += char;
    }
  }
  
  // Add the last value
  values.push(currentValue.trim());
  
  return values;
}

/**
 * Validate CSV headers
 * @param {Array<string>} headers - CSV headers
 * @param {string} filePath - Path to the CSV file
 * @private
 */
function validateCSVHeaders(headers, filePath) {
  const requiredHeaders = {
    'users.csv': ['username', 'password', 'email'],
    'products.csv': ['id', 'name', 'price'],
    'test-scenarios.csv': ['id', 'description', 'expected']
  };
  
  const fileName = path.basename(filePath);
  const required = requiredHeaders[fileName];
  
  if (required) {
    const missing = required.filter(header => !headers.includes(header));
    if (missing.length > 0) {
      throw new Error(`Missing required headers in ${fileName}: ${missing.join(', ')}`);
    }
  }
}

/**
 * Parse XML content
 * @param {string} content - XML content
 * @param {string} filePath - Path to the XML file (for error messages)
 * @param {boolean} validate - Whether to validate the data
 * @returns {Object} Parsed XML data
 * @private
 */
function parseXML(content, filePath, validate) {
  try {
    // Simple XML parser (for basic XML structures)
    const result = {};
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    // Convert XML to JSON
    function xmlToJson(node) {
      // Create object
      let obj = {};
      
      // Attributes
      if (node.attributes && node.attributes.length > 0) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          obj[`@${attr.nodeName}`] = attr.nodeValue;
        }
      }
      
      // Children
      if (node.childNodes && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          
          // Text node
          if (child.nodeType === 3) {
            const text = child.nodeValue.trim();
            if (text) {
              obj['#text'] = text;
            }
          }
          // Element node
          else if (child.nodeType === 1) {
            const childObj = xmlToJson(child);
            
            if (obj[child.nodeName]) {
              if (!Array.isArray(obj[child.nodeName])) {
                obj[child.nodeName] = [obj[child.nodeName]];
              }
              obj[child.nodeName].push(childObj);
            } else {
              obj[child.nodeName] = childObj;
            }
          }
        }
      }
      
      return obj;
    }
    
    // Convert root element to JSON
    const rootElement = xmlDoc.documentElement;
    result[rootElement.nodeName] = xmlToJson(rootElement);
    
    return result;
  } catch (error) {
    throw new Error(`Failed to parse XML: ${error.message}`);
  }
}

/**
 * Clear the data cache
 */
function clearCache() {
  cache.clear();
}

module.exports = {
  readData,
  readJsonData,
  readYamlData,
  readCsvData,
  clearCache
};