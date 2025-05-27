<!-- Source: /Users/mzahirudeen/playwright-framework/examples/templates/README.md -->

# Template Examples

This directory contains example templates for the Playwright Framework's report templates feature.

## Files

- `sales-report-template.json`: Example template for sales reports
- `employee-performance-template.json`: Example template for employee performance reports

## Usage

### Importing a Template

You can import these templates into your dashboard:

1. Start the dashboard: `dashboard`
2. Navigate to the Templates page
3. Click "Import Template" and select one of these files

Alternatively, you can use the API to import a template:

```javascript
const { ReportTemplate } = require('../utils/scheduler');
const path = require('path');

const reportTemplate = new ReportTemplate();
const templateId = reportTemplate.importTemplate(
  path.join(__dirname, 'templates/sales-report-template.json')
);
```

### Using a Template

Once imported, you can use these templates to generate reports:

1. Navigate to the Templates page
2. Find the imported template
3. Click the "Use" button
4. Fill in the required parameters (e.g., file name)
5. Click "Create Report"

## Template Structure

Each template includes:

- **Metadata**: Name, description, and tags
- **Data Source Configuration**: Type, file type, and optional file name
- **Chart Configurations**: Multiple chart definitions with various types and settings

### Sales Report Template

The sales report template includes:

- Bar chart showing sales by product category
- Line chart showing sales trend over time
- Pie chart showing sales distribution by region
- Table showing top performing products

### Employee Performance Template

The employee performance template includes:

- Bar chart showing performance scores by department
- Line chart showing performance trend over time
- Pie chart showing performance rating distribution
- Table showing top performers

## Customizing Templates

You can customize these templates by:

1. Importing them into your dashboard
2. Editing them to match your specific data structure
3. Saving them with a new name

## Data Requirements

For these templates to work properly, your data should include the following fields:

### Sales Report Template

- `category`: Product category
- `date`: Date of sale
- `sales`: Sales amount
- `target`: Target sales amount
- `region`: Sales region
- `product`: Product name
- `growth`: Growth percentage

### Employee Performance Template

- `department`: Employee department
- `quarter`: Time period (e.g., "Q1 2023")
- `performanceScore`: Numerical performance score
- `targetScore`: Target performance score
- `companyAverage`: Company average score
- `rating`: Performance rating (e.g., "Excellent", "Good", etc.)
- `count`: Count of employees with each rating
- `employeeId`: Employee ID
- `firstName`: Employee first name
- `lastName`: Employee last name