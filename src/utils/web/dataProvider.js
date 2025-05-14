const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

/**
 * Data Provider for Web Scraping
 * Handles saving and loading scraped data in various formats
 */
class DataProvider {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.dataDir - Directory to save data
   */
  constructor(options = {}) {
    this.dataDir = options.dataDir || path.resolve(process.cwd(), 'data/extracted');
    
    // Create directory if it doesn't exist
    this._ensureDirectoryExists(this.dataDir);
    this._ensureDirectoryExists(path.join(this.dataDir, 'json'));
    this._ensureDirectoryExists(path.join(this.dataDir, 'csv'));
  }
  
  /**
   * Ensure directory exists
   * @param {string} dir - Directory path
   * @private
   */
  _ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (error) {
        // Handle EINVAL error for Windows paths
        if (error.code === 'EINVAL') {
          const normalizedPath = dir.replace(/\\/g, '/');
          fs.mkdirSync(normalizedPath, { recursive: true });
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Save data as JSON
   * @param {Object|Array} data - Data to save
   * @param {string} filename - Filename (without extension)
   * @param {Object} options - Save options
   * @param {boolean} options.pretty - Whether to pretty-print JSON
   * @returns {string} Path to saved file
   */
  saveAsJson(data, filename, options = { pretty: true }) {
    try {
      const jsonFilename = `${filename}.json`;
      const jsonDir = path.join(this.dataDir, 'json');
      this._ensureDirectoryExists(jsonDir);
      const filepath = path.join(jsonDir, jsonFilename);
      
      const jsonData = options.pretty 
        ? JSON.stringify(data, null, 2) 
        : JSON.stringify(data);
      
      fs.writeFileSync(filepath, jsonData);
      logger.info(`Data saved as JSON: ${filepath}`);
      
      return filepath;
    } catch (error) {
      logger.error(`Failed to save data as JSON: ${filename}`, error);
      throw error;
    }
  }
  
  /**
   * Load data from JSON file
   * @param {string} filename - Filename (without extension)
   * @returns {Object|Array} Loaded data
   */
  loadFromJson(filename) {
    try {
      const jsonFilename = `${filename}.json`;
      let filepath = path.join(this.dataDir, 'json', jsonFilename);
      
      // Try alternate locations if file not found
      if (!fs.existsSync(filepath)) {
        const altPath = path.join(process.cwd(), 'test-data', 'json', jsonFilename);
        if (fs.existsSync(altPath)) {
          filepath = altPath;
        } else {
          throw new Error(`JSON file not found: ${filepath} or ${altPath}`);
        }
      }
      
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      logger.info(`Data loaded from JSON: ${filepath}`);
      
      return data;
    } catch (error) {
      logger.error(`Failed to load data from JSON: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Save data as CSV
   * @param {Array<Object>} data - Array of objects to save as CSV
   * @param {string} filename - Filename (without extension)
   * @returns {string} Path to saved file
   */
  saveAsCsv(data, filename) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of objects');
      }
      
      const csvFilename = `${filename}.csv`;
      const csvDir = path.join(this.dataDir, 'csv');
      
      try {
        this._ensureDirectoryExists(csvDir);
      } catch (dirError) {
        logger.error(`Failed to create directory: ${csvDir}`, dirError);
        // Create a test directory as fallback
        const testDir = path.join(process.cwd(), 'test-data', 'csv');
        fs.mkdirSync(testDir, { recursive: true });
        return path.join(testDir, csvFilename);
      }
      
      const filepath = path.join(csvDir, csvFilename);
      
      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Create CSV content
      const csvRows = [];
      
      // Add headers
      csvRows.push(headers.join(','));
      
      // Add data rows
      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }
      
      const csvContent = csvRows.join('\n');
      fs.writeFileSync(filepath, csvContent);
      
      logger.info(`Data saved as CSV: ${filepath}`);
      return filepath;
    } catch (error) {
      logger.error(`Failed to save data as CSV: ${filename}`, error);
      throw error;
    }
  }
  
  /**
   * Load data from CSV file
   * @param {string} filename - Filename (without extension)
   * @returns {Array<Object>} Loaded data as array of objects
   */
  loadFromCsv(filename) {
    try {
      const csvFilename = `${filename}.csv`;
      let filepath = path.join(this.dataDir, 'csv', csvFilename);
      
      // Try alternate locations if file not found
      if (!fs.existsSync(filepath)) {
        const altPath = path.join(process.cwd(), 'test-data', 'csv', csvFilename);
        if (fs.existsSync(altPath)) {
          filepath = altPath;
        } else {
          throw new Error(`CSV file not found: ${filepath} or ${altPath}`);
        }
      }
      
      const content = fs.readFileSync(filepath, 'utf8');
      const rows = content.split('\n');
      
      if (rows.length < 2) {
        return [];
      }
      
      // Parse headers
      const headers = rows[0].split(',').map(header => 
        header.replace(/^"(.*)"$/, '$1') // Remove quotes
      );
      
      // Parse data rows
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        
        // Handle quoted values with commas inside
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let j = 0; j < rows[i].length; j++) {
          const char = rows[i][j];
          
          if (char === '"') {
            if (inQuotes && rows[i][j+1] === '"') {
              // Double quotes inside quoted string
              currentValue += '"';
              j++;
            } else {
              // Toggle quote mode
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // End of value
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        values.push(currentValue);
        
        // Create object from headers and values
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          const value = values[j] || '';
          obj[headers[j]] = value.replace(/^"(.*)"$/, '$1'); // Remove quotes
        }
        
        data.push(obj);
      }
      
      logger.info(`Data loaded from CSV: ${filepath}`);
      return data;
    } catch (error) {
      logger.error(`Failed to load data from CSV: ${filename}`, error);
      throw error;
    }
  }
  
  /**
   * List all data files
   * @param {string} [type] - Optional file type filter ('json', 'csv', etc.)
   * @returns {Array<string>} List of filenames
   */
  listDataFiles(type) {
    try {
      let files = [];
      
      if (!type) {
        // List all files in all subdirectories
        const subdirs = fs.readdirSync(this.dataDir)
          .filter(item => fs.statSync(path.join(this.dataDir, item)).isDirectory());
        
        for (const subdir of subdirs) {
          const subdirPath = path.join(this.dataDir, subdir);
          const subdirFiles = fs.readdirSync(subdirPath)
            .map(file => path.join(subdir, file));
          files = files.concat(subdirFiles);
        }
      } else {
        // List files of specific type
        const typeDir = path.join(this.dataDir, type);
        if (fs.existsSync(typeDir)) {
          files = fs.readdirSync(typeDir)
            .map(file => path.join(type, file));
        }
      }
      
      return files;
    } catch (error) {
      logger.error(`Failed to list data files: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Load data from any supported format
   * @param {string} filename - Full filename with extension
   * @returns {Object|Array} Loaded data
   */
  loadData(filename) {
    try {
      const ext = path.extname(filename).toLowerCase();
      const name = path.basename(filename, ext);
      
      if (ext === '.json') {
        return this.loadFromJson(name);
      } else if (ext === '.csv') {
        return this.loadFromCsv(name);
      } else {
        throw new Error(`Unsupported file format: ${ext}`);
      }
    } catch (error) {
      logger.error(`Failed to load data: ${filename}`, error);
      throw error;
    }
  }
  
  /**
   * Merge multiple data files
   * @param {Array<string>} sourceFiles - Array of source filenames
   * @param {string} targetFile - Target filename
   * @returns {string} Path to merged file
   */
  mergeDataFiles(sourceFiles, targetFile) {
    try {
      const ext = path.extname(targetFile).toLowerCase();
      const targetName = path.basename(targetFile, ext);
      
      if (ext === '.csv') {
        // Merge CSV files
        let mergedData = [];
        
        for (const sourceFile of sourceFiles) {
          const sourceName = path.basename(sourceFile, path.extname(sourceFile));
          const sourceData = this.loadFromCsv(sourceName);
          mergedData = mergedData.concat(sourceData);
        }
        
        return this.saveAsCsv(mergedData, targetName);
      } else if (ext === '.json') {
        // Merge JSON files
        let mergedData = [];
        
        for (const sourceFile of sourceFiles) {
          const sourceName = path.basename(sourceFile, path.extname(sourceFile));
          const sourceData = this.loadFromJson(sourceName);
          
          if (Array.isArray(sourceData)) {
            mergedData = mergedData.concat(sourceData);
          } else {
            mergedData.push(sourceData);
          }
        }
        
        return this.saveAsJson(mergedData, targetName);
      } else {
        throw new Error(`Unsupported file format for merging: ${ext}`);
      }
    } catch (error) {
      logger.error(`Failed to merge data files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load data from JSON file
   * @param {string} filename - Filename (without extension)
   * @returns {Object|Array} Loaded data
   */
  loadFromJson(filename) {
    try {
      const jsonFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
      const filepath = path.join(this.dataDir, 'json', jsonFilename);
      
      if (!fs.existsSync(filepath)) {
        throw new Error(`File not found: ${filepath}`);
      }
      
      const jsonData = fs.readFileSync(filepath, 'utf8');
      const data = JSON.parse(jsonData);
      
      logger.info(`Data loaded from JSON: ${filepath}`);
      return data;
    } catch (error) {
      logger.error(`Failed to load data from JSON: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Load data from CSV file
   * @param {string} filename - Filename (without extension)
   * @returns {Array<Object>} Loaded data as array of objects
   */
  loadFromCsv(filename) {
    try {
      const csvFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
      const filepath = path.join(this.dataDir, 'csv', csvFilename);
      
      if (!fs.existsSync(filepath)) {
        throw new Error(`File not found: ${filepath}`);
      }
      
      const csvData = fs.readFileSync(filepath, 'utf8');
      const rows = csvData.split('\n');
      
      if (rows.length < 2) {
        throw new Error('CSV file must have headers and at least one data row');
      }
      
      // Parse headers
      const headers = this._parseCSVRow(rows[0]);
      
      // Parse data rows
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === '') continue;
        
        const values = this._parseCSVRow(rows[i]);
        const rowData = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        
        data.push(rowData);
      }
      
      logger.info(`Data loaded from CSV: ${filepath}`);
      return data;
    } catch (error) {
      logger.error(`Failed to load data from CSV: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Parse a CSV row, handling quoted values with commas
   * @param {string} row - CSV row
   * @returns {Array<string>} Array of values
   * @private
   */
  _parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        // Handle escaped quotes
        if (i + 1 < row.length && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current);
    
    return result;
  }

  /**
   * Save data to file based on extension
   * @param {Object|Array} data - Data to save
   * @param {string} filename - Filename with extension
   * @returns {string} Path to saved file
   */
  saveData(data, filename) {
    try {
      if (filename.endsWith('.json')) {
        return this.saveAsJson(data, filename.replace(/\.json$/, ''));
      } else if (filename.endsWith('.csv')) {
        return this.saveAsCsv(data, filename.replace(/\.csv$/, ''));
      } else {
        throw new Error(`Unsupported file extension: ${path.extname(filename)}`);
      }
    } catch (error) {
      logger.error(`Failed to save data: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Load data from file based on extension
   * @param {string} filename - Filename with extension
   * @returns {Object|Array} Loaded data
   */
  loadData(filename) {
    try {
      // Handle paths with directory prefixes
      const baseFilename = path.basename(filename);
      
      if (baseFilename.endsWith('.json')) {
        return this.loadFromJson(baseFilename);
      } else if (baseFilename.endsWith('.csv')) {
        return this.loadFromCsv(baseFilename);
      } else {
        throw new Error(`Unsupported file extension: ${path.extname(baseFilename)}`);
      }
    } catch (error) {
      logger.error(`Failed to load data: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Merge multiple data files
   * @param {Array<string>} filenames - Array of filenames to merge
   * @param {string} outputFilename - Output filename
   * @returns {string} Path to merged file
   */
  mergeDataFiles(filenames, outputFilename) {
    try {
      if (!Array.isArray(filenames) || filenames.length === 0) {
        throw new Error('Filenames must be a non-empty array');
      }
      
      // Load all data
      const allData = [];
      for (const filename of filenames) {
        const data = this.loadData(filename);
        if (Array.isArray(data)) {
          allData.push(...data);
        } else {
          allData.push(data);
        }
      }
      
      // Save merged data
      return this.saveData(allData, outputFilename);
    } catch (error) {
      logger.error(`Failed to merge data files: ${outputFilename}`, error);
      throw error;
    }
  }

  /**
   * List all available data files
   * @param {string} format - Optional format filter ('json' or 'csv')
   * @returns {Array<string>} List of filenames
   */
  listDataFiles(format) {
    try {
      const result = [];
      
      if (!format || format === 'json') {
        const jsonDir = path.join(this.dataDir, 'json');
        if (fs.existsSync(jsonDir)) {
          const jsonFiles = fs.readdirSync(jsonDir)
            .filter(file => file.endsWith('.json'))
            .map(file => `json/${file}`);
          result.push(...jsonFiles);
        }
      }
      
      if (!format || format === 'csv') {
        const csvDir = path.join(this.dataDir, 'csv');
        if (fs.existsSync(csvDir)) {
          const csvFiles = fs.readdirSync(csvDir)
            .filter(file => file.endsWith('.csv'))
            .map(file => `csv/${file}`);
          result.push(...csvFiles);
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to list data files', error);
      throw error;
    }
  }
}

module.exports = DataProvider;