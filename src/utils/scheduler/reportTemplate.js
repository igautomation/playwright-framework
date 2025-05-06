const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PlaywrightService } = require('../common');
const logger = require('../common/logger');
const TestDataFactory = require('../common/testDataFactory');

/**
 * Report Template Manager for creating and managing report templates
 */
class ReportTemplate {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.templatesDir - Directory to store templates
   */
  constructor(options = {}) {
    this.templatesDir = options.templatesDir || path.resolve(process.cwd(), 'data/templates');
    
    // Create templates directory if it doesn't exist
    this._ensureDirectoryExists(this.templatesDir);
    
    // Initialize templates index
    this.templatesIndex = this._loadTemplatesIndex();
    
    // Initialize Playwright service
    this.playwrightService = new PlaywrightService({
      outputDir: path.join(process.cwd(), 'reports/templates')
    });
  }
  
  /**
   * Ensure directory exists
   * @param {string} dir - Directory path
   * @private
   */
  _ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  /**
   * Load templates index
   * @returns {Object} Templates index
   * @private
   */
  _loadTemplatesIndex() {
    try {
      const indexPath = path.join(this.templatesDir, 'index.json');
      
      if (!fs.existsSync(indexPath)) {
        return { templates: [] };
      }
      
      return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch (error) {
      logger.error('Failed to load templates index', error);
      return { templates: [] };
    }
  }
  
  /**
   * Save templates index
   * @private
   */
  _saveTemplatesIndex() {
    try {
      const indexPath = path.join(this.templatesDir, 'index.json');
      fs.writeFileSync(indexPath, JSON.stringify(this.templatesIndex, null, 2));
    } catch (error) {
      logger.error('Failed to save templates index', error);
    }
  }
  
  /**
   * Create a new template
   * @param {Object} template - Template configuration
   * @param {string} template.name - Template name
   * @param {string} template.description - Template description
   * @param {Object} template.dataSource - Data source configuration
   * @param {Array<Object>} template.charts - Chart configurations
   * @param {Array<string>} template.tags - Template tags
   * @returns {string} Template ID
   */
  createTemplate(template) {
    try {
      // Validate template
      if (!template.name) {
        throw new Error('Template name is required');
      }
      
      if (!template.dataSource) {
        throw new Error('Data source configuration is required');
      }
      
      if (!template.charts || !Array.isArray(template.charts) || template.charts.length === 0) {
        throw new Error('At least one chart configuration is required');
      }
      
      // Generate ID if not provided
      const id = template.id || `template-${uuidv4()}`;
      
      // Create template object
      const newTemplate = {
        id,
        name: template.name,
        description: template.description || '',
        dataSource: template.dataSource,
        charts: template.charts,
        tags: template.tags || [],
        createdAt: template.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to index
      const existingIndex = this.templatesIndex.templates.findIndex(t => t.id === id);
      if (existingIndex >= 0) {
        this.templatesIndex.templates[existingIndex] = newTemplate;
      } else {
        this.templatesIndex.templates.push(newTemplate);
      }
      
      // Save index
      this._saveTemplatesIndex();
      
      // Save template file
      const templatePath = path.join(this.templatesDir, `${id}.json`);
      fs.writeFileSync(templatePath, JSON.stringify(newTemplate, null, 2));
      
      logger.info(`Template created: ${id}`);
      return id;
    } catch (error) {
      logger.error('Failed to create template', error);
      throw error;
    }
  }
  
  /**
   * Get all templates
   * @param {Object} options - Filter options
   * @param {string} options.search - Search term for name or description
   * @param {Array<string>} options.tags - Filter by tags
   * @returns {Array<Object>} Templates
   */
  getTemplates(options = {}) {
    try {
      let templates = [...this.templatesIndex.templates];
      
      // Apply filters
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        templates = templates.filter(template => 
          template.name.toLowerCase().includes(searchTerm) ||
          template.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (options.tags && options.tags.length > 0) {
        templates = templates.filter(template => 
          options.tags.some(tag => template.tags.includes(tag))
        );
      }
      
      return templates;
    } catch (error) {
      logger.error('Failed to get templates', error);
      return [];
    }
  }
  
  /**
   * Get a template by ID
   * @param {string} id - Template ID
   * @returns {Object|null} Template
   */
  getTemplate(id) {
    try {
      const templatePath = path.join(this.templatesDir, `${id}.json`);
      
      if (!fs.existsSync(templatePath)) {
        return null;
      }
      
      return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    } catch (error) {
      logger.error(`Failed to get template: ${id}`, error);
      return null;
    }
  }
  
  /**
   * Update a template
   * @param {string} id - Template ID
   * @param {Object} updates - Template updates
   * @returns {Object} Updated template
   */
  updateTemplate(id, updates) {
    try {
      const template = this.getTemplate(id);
      
      if (!template) {
        throw new Error(`Template not found: ${id}`);
      }
      
      // Update template
      const updatedTemplate = {
        ...template,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };
      
      // Update index
      const index = this.templatesIndex.templates.findIndex(t => t.id === id);
      if (index >= 0) {
        this.templatesIndex.templates[index] = updatedTemplate;
      }
      
      // Save index
      this._saveTemplatesIndex();
      
      // Save template file
      const templatePath = path.join(this.templatesDir, `${id}.json`);
      fs.writeFileSync(templatePath, JSON.stringify(updatedTemplate, null, 2));
      
      logger.info(`Template updated: ${id}`);
      return updatedTemplate;
    } catch (error) {
      logger.error(`Failed to update template: ${id}`, error);
      throw error;
    }
  }
  
  /**
   * Delete a template
   * @param {string} id - Template ID
   * @returns {boolean} Success
   */
  deleteTemplate(id) {
    try {
      const templatePath = path.join(this.templatesDir, `${id}.json`);
      
      if (!fs.existsSync(templatePath)) {
        return false;
      }
      
      // Remove from index
      this.templatesIndex.templates = this.templatesIndex.templates.filter(t => t.id !== id);
      
      // Save index
      this._saveTemplatesIndex();
      
      // Delete file
      fs.unlinkSync(templatePath);
      
      logger.info(`Template deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete template: ${id}`, error);
      return false;
    }
  }
  
  /**
   * Create a report configuration from a template
   * @param {string} templateId - Template ID
   * @param {Object} params - Parameters to customize the template
   * @returns {Object} Report configuration
   */
  createReportFromTemplate(templateId, params = {}) {
    try {
      const template = this.getTemplate(templateId);
      
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      // Create a deep copy of the template
      const reportConfig = JSON.parse(JSON.stringify(template));
      
      // Apply parameters
      if (params.title) {
        reportConfig.name = params.title;
      }
      
      if (params.dataSource) {
        reportConfig.dataSource = {
          ...reportConfig.dataSource,
          ...params.dataSource
        };
      }
      
      // Apply chart-specific parameters
      if (params.charts && Array.isArray(params.charts)) {
        params.charts.forEach((chartParams, index) => {
          if (index < reportConfig.charts.length) {
            reportConfig.charts[index] = {
              ...reportConfig.charts[index],
              ...chartParams
            };
          }
        });
      }
      
      // Remove template-specific fields
      delete reportConfig.id;
      delete reportConfig.createdAt;
      delete reportConfig.updatedAt;
      
      return {
        title: reportConfig.name,
        dataSource: reportConfig.dataSource,
        charts: reportConfig.charts
      };
    } catch (error) {
      logger.error(`Failed to create report from template: ${templateId}`, error);
      throw error;
    }
  }
  
  /**
   * Generate sample data for a template
   * @param {string} templateId - Template ID
   * @param {number} count - Number of records to generate
   * @returns {Array<Object>} Sample data
   */
  generateSampleData(templateId, count = 10) {
    try {
      const template = this.getTemplate(templateId);
      
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      // Determine the data structure based on the template
      const dataStructure = this._inferDataStructure(template);
      
      // Generate sample data
      const sampleData = [];
      
      for (let i = 0; i < count; i++) {
        if (dataStructure === 'user') {
          sampleData.push(TestDataFactory.generateUser());
        } else if (dataStructure === 'product') {
          sampleData.push(TestDataFactory.generateProduct());
        } else if (dataStructure === 'order') {
          sampleData.push(TestDataFactory.generateOrder());
        } else if (dataStructure === 'employee') {
          sampleData.push(TestDataFactory.generateEmployee());
        } else {
          // Generic data
          sampleData.push({
            id: i + 1,
            name: `Item ${i + 1}`,
            value: Math.floor(Math.random() * 100),
            category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
      
      return sampleData;
    } catch (error) {
      logger.error(`Failed to generate sample data for template: ${templateId}`, error);
      throw error;
    }
  }
  
  /**
   * Infer data structure from template
   * @param {Object} template - Template object
   * @returns {string} Data structure type
   * @private
   */
  _inferDataStructure(template) {
    // Check chart configurations for clues about data structure
    const chartTitles = template.charts.map(chart => chart.title?.toLowerCase() || '');
    const chartAxes = template.charts
      .filter(chart => chart.xAxis || chart.yAxis)
      .flatMap(chart => [
        ...(Array.isArray(chart.xAxis) ? chart.xAxis : [chart.xAxis]),
        ...(Array.isArray(chart.yAxis) ? chart.yAxis : [chart.yAxis])
      ])
      .filter(Boolean)
      .map(axis => axis.toLowerCase());
    
    // Check for user data
    if (
      chartTitles.some(title => title.includes('user')) ||
      chartAxes.some(axis => ['username', 'email', 'firstname', 'lastname'].includes(axis))
    ) {
      return 'user';
    }
    
    // Check for product data
    if (
      chartTitles.some(title => title.includes('product')) ||
      chartAxes.some(axis => ['price', 'category', 'productname'].includes(axis))
    ) {
      return 'product';
    }
    
    // Check for order data
    if (
      chartTitles.some(title => title.includes('order')) ||
      chartAxes.some(axis => ['orderid', 'total', 'status'].includes(axis))
    ) {
      return 'order';
    }
    
    // Check for employee data
    if (
      chartTitles.some(title => title.includes('employee')) ||
      chartAxes.some(axis => ['employeeid', 'jobtitle', 'department'].includes(axis))
    ) {
      return 'employee';
    }
    
    // Default to generic
    return 'generic';
  }
  
  /**
   * Clone a template
   * @param {string} id - Template ID to clone
   * @param {string} newName - Name for the cloned template
   * @returns {string} New template ID
   */
  cloneTemplate(id, newName) {
    try {
      const template = this.getTemplate(id);
      
      if (!template) {
        throw new Error(`Template not found: ${id}`);
      }
      
      // Create a deep copy
      const clonedTemplate = JSON.parse(JSON.stringify(template));
      
      // Update fields
      clonedTemplate.id = `template-${uuidv4()}`;
      clonedTemplate.name = newName || `${template.name} (Copy)`;
      clonedTemplate.createdAt = new Date().toISOString();
      clonedTemplate.updatedAt = new Date().toISOString();
      
      // Add to index
      this.templatesIndex.templates.push(clonedTemplate);
      
      // Save index
      this._saveTemplatesIndex();
      
      // Save template file
      const templatePath = path.join(this.templatesDir, `${clonedTemplate.id}.json`);
      fs.writeFileSync(templatePath, JSON.stringify(clonedTemplate, null, 2));
      
      logger.info(`Template cloned: ${id} -> ${clonedTemplate.id}`);
      return clonedTemplate.id;
    } catch (error) {
      logger.error(`Failed to clone template: ${id}`, error);
      throw error;
    }
  }
  
  /**
   * Get all tags used in templates
   * @returns {Array<string>} Tags
   */
  getAllTags() {
    try {
      const tags = new Set();
      
      this.templatesIndex.templates.forEach(template => {
        if (template.tags) {
          template.tags.forEach(tag => tags.add(tag));
        }
      });
      
      return Array.from(tags);
    } catch (error) {
      logger.error('Failed to get all tags', error);
      return [];
    }
  }
  
  /**
   * Import a template from a file
   * @param {string} filePath - Path to template file
   * @returns {string} Template ID
   */
  importTemplate(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const template = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Ensure it has required fields
      if (!template.name || !template.dataSource || !template.charts) {
        throw new Error('Invalid template format');
      }
      
      // Generate a new ID
      template.id = `template-${uuidv4()}`;
      
      return this.createTemplate(template);
    } catch (error) {
      logger.error(`Failed to import template from file: ${filePath}`, error);
      throw error;
    }
  }
  
  /**
   * Export a template to a file
   * @param {string} id - Template ID
   * @param {string} outputPath - Output file path
   * @returns {string} Output file path
   */
  exportTemplate(id, outputPath) {
    try {
      const template = this.getTemplate(id);
      
      if (!template) {
        throw new Error(`Template not found: ${id}`);
      }
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      this._ensureDirectoryExists(outputDir);
      
      // Write template to file
      fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));
      
      logger.info(`Template exported: ${id} -> ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error(`Failed to export template: ${id}`, error);
      throw error;
    }
  }
  
  /**
   * Generate a test report from a template
   * @param {string} templateId - Template ID
   * @returns {Promise<string>} Path to the generated report
   */
  async generateTestReport(templateId) {
    try {
      const template = this.getTemplate(templateId);
      
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      // Generate sample data
      const sampleData = this.generateSampleData(templateId, 20);
      
      // Create temporary data file
      const tempDir = path.join(process.cwd(), 'data/temp');
      this._ensureDirectoryExists(tempDir);
      
      const tempDataPath = path.join(tempDir, `${templateId}-test-data.json`);
      fs.writeFileSync(tempDataPath, JSON.stringify(sampleData, null, 2));
      
      // Create report configuration
      const reportConfig = this.createReportFromTemplate(templateId, {
        title: `${template.name} - Test Report`,
        dataSource: {
          type: 'file',
          fileType: 'json',
          fileName: path.basename(tempDataPath)
        }
      });
      
      // Generate report
      // Note: This is a placeholder - you would need to implement the actual report generation
      // using your ChartGenerator or similar class
      const reportDir = path.join(process.cwd(), 'reports/test', `${templateId}-test`);
      this._ensureDirectoryExists(reportDir);
      
      // Create a simple HTML report for testing
      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${reportConfig.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .chart { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>${reportConfig.title}</h1>
          ${reportConfig.charts.map((chart, i) => `
            <div class="chart">
              <h2>${chart.title || `Chart ${i + 1}`}</h2>
              <p>Type: ${chart.type}</p>
              <div class="chart-container" id="chart-${i}"></div>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      
      fs.writeFileSync(path.join(reportDir, 'index.html'), reportHtml);
      
      return reportDir;
    } catch (error) {
      logger.error(`Failed to generate test report for template: ${templateId}`, error);
      throw error;
    }
  }
  
  /**
   * Validate template accessibility
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Accessibility validation results
   */
  async validateAccessibility(templateId) {
    try {
      // Generate a test report
      const reportPath = await this.generateTestReport(templateId);
      const reportUrl = `file://${path.join(reportPath, 'index.html')}`;
      
      // Run accessibility audit
      const results = await this.playwrightService.runAccessibilityAudit(reportUrl, {
        waitForSelector: '.chart-container',
        reportPath: path.join(reportPath, 'accessibility-report.json')
      });
      
      return results;
    } catch (error) {
      logger.error(`Accessibility validation failed for template: ${templateId}`, error);
      throw new Error(`Accessibility validation failed: ${error.message}`);
    }
  }
  
  /**
   * Test template responsiveness
   * @param {string} templateId - Template ID
   * @returns {Promise<Array<Object>>} Responsiveness test results
   */
  async testResponsiveness(templateId) {
    try {
      // Generate a test report
      const reportPath = await this.generateTestReport(templateId);
      const reportUrl = `file://${path.join(reportPath, 'index.html')}`;
      
      // Test responsiveness
      const results = await this.playwrightService.testResponsiveness(reportUrl, [], {
        waitForSelector: '.chart-container',
        fullPage: true
      });
      
      // Save results to report directory
      fs.writeFileSync(
        path.join(reportPath, 'responsiveness-report.json'),
        JSON.stringify(results, null, 2)
      );
      
      return results;
    } catch (error) {
      logger.error(`Responsiveness test failed for template: ${templateId}`, error);
      throw new Error(`Responsiveness test failed: ${error.message}`);
    }
  }
  
  /**
   * Preview template with mock data
   * @param {string} templateId - Template ID
   * @param {Array<Object>} mockData - Mock data to use
   * @returns {Promise<string>} Path to the preview screenshot
   */
  async previewWithMockData(templateId, mockData) {
    try {
      // Generate a test report with the provided mock data
      const template = this.getTemplate(templateId);
      
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      // Create temporary data file
      const tempDir = path.join(process.cwd(), 'data/temp');
      this._ensureDirectoryExists(tempDir);
      
      const tempDataPath = path.join(tempDir, `${templateId}-mock-data.json`);
      fs.writeFileSync(tempDataPath, JSON.stringify(mockData, null, 2));
      
      // Create report configuration
      const reportConfig = this.createReportFromTemplate(templateId, {
        title: `${template.name} - Preview`,
        dataSource: {
          type: 'file',
          fileType: 'json',
          fileName: path.basename(tempDataPath)
        }
      });
      
      // Generate preview report
      const previewDir = path.join(process.cwd(), 'reports/previews', `${templateId}-preview`);
      this._ensureDirectoryExists(previewDir);
      
      // Create a simple HTML report for preview
      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${reportConfig.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .chart { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>${reportConfig.title}</h1>
          ${reportConfig.charts.map((chart, i) => `
            <div class="chart">
              <h2>${chart.title || `Chart ${i + 1}`}</h2>
              <p>Type: ${chart.type}</p>
              <div class="chart-container" id="chart-${i}"></div>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      
      fs.writeFileSync(path.join(previewDir, 'index.html'), reportHtml);
      
      // Capture screenshot
      const screenshotPath = path.join(previewDir, 'preview.png');
      await this.playwrightService.captureScreenshot(`file://${path.join(previewDir, 'index.html')}`, {
        path: screenshotPath,
        fullPage: true,
        waitForSelector: '.chart-container'
      });
      
      return screenshotPath;
    } catch (error) {
      logger.error(`Failed to preview template with mock data: ${templateId}`, error);
      throw new Error(`Template preview failed: ${error.message}`);
    }
  }
}

module.exports = ReportTemplate;