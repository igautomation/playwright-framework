const logger = require('../common/logger');

/**
 * Data Analyzer for processing scraped data
 */
class DataAnalyzer {
  /**
   * Constructor
   */
  constructor() {
    // No initialization needed
  }
  
  /**
   * Extract a specific column from an array of objects
   * @param {Array<Object>} data - Array of objects
   * @param {string} column - Column name to extract
   * @returns {Array} Extracted column values
   */
  extractColumn(data, column) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of objects');
      }
      
      return data.map(item => item[column]);
    } catch (error) {
      logger.error(`Failed to extract column ${column}`, error);
      throw error;
    }
  }
  
  /**
   * Count occurrences of values in a column
   * @param {Array<Object>} data - Array of objects
   * @param {string} column - Column name to count
   * @returns {Object} Object with counts for each value
   */
  countValues(data, column) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of objects');
      }
      
      return data.reduce((counts, item) => {
        const value = item[column];
        counts[value] = (counts[value] || 0) + 1;
        return counts;
      }, {});
    } catch (error) {
      logger.error(`Failed to count values in column ${column}`, error);
      throw error;
    }
  }
  
  /**
   * Calculate statistics for a numeric column
   * @param {Array<Object>} data - Array of objects
   * @param {string} column - Column name to analyze
   * @returns {Object} Statistics object
   */
  calculateStats(data, column) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of objects');
      }
      
      const values = data
        .map(item => parseFloat(item[column]))
        .filter(value => !isNaN(value));
      
      if (values.length === 0) {
        throw new Error(`No numeric values found in column ${column}`);
      }
      
      const sum = values.reduce((acc, val) => acc + val, 0);
      const mean = sum / values.length;
      
      // Sort values for median and percentiles
      const sortedValues = [...values].sort((a, b) => a - b);
      
      // Calculate median
      const midIndex = Math.floor(sortedValues.length / 2);
      const median = sortedValues.length % 2 === 0
        ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
        : sortedValues[midIndex];
      
      // Calculate standard deviation
      const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculate min, max
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Calculate percentiles
      const percentile25 = this._calculatePercentile(sortedValues, 25);
      const percentile75 = this._calculatePercentile(sortedValues, 75);
      const percentile90 = this._calculatePercentile(sortedValues, 90);
      
      return {
        count: values.length,
        min,
        max,
        sum,
        mean,
        median,
        stdDev,
        variance,
        percentile25,
        percentile75,
        percentile90
      };
    } catch (error) {
      logger.error(`Failed to calculate statistics for column ${column}`, error);
      throw error;
    }
  }
  
  /**
   * Calculate percentile value
   * @param {Array<number>} sortedValues - Sorted array of values
   * @param {number} percentile - Percentile to calculate (0-100)
   * @returns {number} Percentile value
   * @private
   */
  _calculatePercentile(sortedValues, percentile) {
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (upper >= sortedValues.length) {
      return sortedValues[lower];
    }
    
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }
  
  /**
   * Group data by a column
   * @param {Array<Object>} data - Array of objects
   * @param {string} groupBy - Column name to group by
   * @returns {Object} Grouped data
   */
  groupBy(data, groupBy) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of objects');
      }
      
      return data.reduce((groups, item) => {
        const key = item[groupBy];
        groups[key] = groups[key] || [];
        groups[key].push(item);
        return groups;
      }, {});
    } catch (error) {
      logger.error(`Failed to group data by ${groupBy}`, error);
      throw error;
    }
  }
  
  /**
   * Filter data by a condition
   * @param {Array<Object>} data - Array of objects
   * @param {Function} filterFn - Filter function
   * @returns {Array<Object>} Filtered data
   */
  filter(data, filterFn) {
    try {
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array of objects');
      }
      
      return data.filter(filterFn);
    } catch (error) {
      logger.error('Failed to filter data', error);
      throw error;
    }
  }
  
  /**
   * Sort data by a column
   * @param {Array<Object>} data - Array of objects
   * @param {string} column - Column name to sort by
   * @param {boolean} ascending - Sort direction
   * @returns {Array<Object>} Sorted data
   */
  sort(data, column, ascending = true) {
    try {
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array of objects');
      }
      
      return [...data].sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];
        
        // Handle numeric values
        if (!isNaN(valueA) && !isNaN(valueB)) {
          return ascending
            ? parseFloat(valueA) - parseFloat(valueB)
            : parseFloat(valueB) - parseFloat(valueA);
        }
        
        // Handle string values
        const stringA = String(valueA).toLowerCase();
        const stringB = String(valueB).toLowerCase();
        
        return ascending
          ? stringA.localeCompare(stringB)
          : stringB.localeCompare(stringA);
      });
    } catch (error) {
      logger.error(`Failed to sort data by ${column}`, error);
      throw error;
    }
  }
  
  /**
   * Find top N values by a column
   * @param {Array<Object>} data - Array of objects
   * @param {string} column - Column name to analyze
   * @param {number} n - Number of top values to return
   * @returns {Array<Object>} Top N values
   */
  findTopValues(data, column, n = 5) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of objects');
      }
      
      return this.sort(data, column, false).slice(0, n);
    } catch (error) {
      logger.error(`Failed to find top ${n} values for column ${column}`, error);
      throw error;
    }
  }
  
  /**
   * Calculate frequency distribution for a column
   * @param {Array<Object>} data - Array of objects
   * @param {string} column - Column name to analyze
   * @returns {Object} Frequency distribution
   */
  frequencyDistribution(data, column) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of objects');
      }
      
      const counts = this.countValues(data, column);
      const total = data.length;
      
      const result = {
        counts,
        percentages: {},
        total
      };
      
      // Calculate percentages
      for (const [key, count] of Object.entries(counts)) {
        result.percentages[key] = (count / total) * 100;
      }
      
      return result;
    } catch (error) {
      logger.error(`Failed to calculate frequency distribution for column ${column}`, error);
      throw error;
    }
  }
  
  /**
   * Prepare data for chart visualization
   * @param {Array<Object>} data - Array of objects
   * @param {string} labelColumn - Column to use for labels
   * @param {string|Array<string>} valueColumns - Column(s) to use for values
   * @param {string} chartType - Type of chart ('bar', 'line', 'pie')
   * @returns {Object} Chart configuration
   */
  prepareChartData(data, labelColumn, valueColumns, chartType = 'bar') {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of objects');
      }
      
      const labels = this.extractColumn(data, labelColumn);
      
      // Handle single value column
      if (typeof valueColumns === 'string') {
        valueColumns = [valueColumns];
      }
      
      // Generate random colors for datasets
      const generateColor = (index) => {
        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC249', '#EA526F', '#23B5D3', '#279AF1'
        ];
        return colors[index % colors.length];
      };
      
      // Prepare datasets
      const datasets = valueColumns.map((column, index) => {
        const color = generateColor(index);
        
        if (chartType === 'pie') {
          return {
            data: this.extractColumn(data, column),
            backgroundColor: data.map((_, i) => generateColor(i))
          };
        }
        
        return {
          label: column,
          data: this.extractColumn(data, column),
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1
        };
      });
      
      // Return chart configuration
      if (chartType === 'pie') {
        return {
          labels,
          data: datasets[0].data,
          backgroundColor: datasets[0].backgroundColor
        };
      }
      
      return {
        labels,
        datasets
      };
    } catch (error) {
      logger.error('Failed to prepare chart data', error);
      throw error;
    }
  }
}

module.exports = DataAnalyzer;