<!-- Source: /Users/mzahirudeen/playwright-framework/docs/report-templates-guide.md -->

# Report Templates Guide

This guide explains how to use the report templates feature in the Playwright framework.

## Overview

The report templates feature allows you to create reusable templates for commonly generated reports. This is useful for:

- Maintaining consistent reporting formats
- Quickly generating new reports
- Sharing report configurations with others
- Standardizing data visualization across your organization

## Accessing Report Templates

You can access the report templates through the dashboard:

1. Start the dashboard: `dashboard`
2. Navigate to the "Templates" section in the sidebar
3. Browse and manage your report templates

## Creating Templates

To create a new report template:

1. Click "Create Template" in the Templates page
2. Fill in the template details:
   - **Name**: A descriptive name for the template
   - **Description**: Optional description
   - **Tags**: Keywords to help organize templates
3. Configure the data source:
   - **Source Type**: File, API, or Database
   - **File Type**: JSON or CSV (if File is selected)
   - **File Name**: Specify a file name or leave blank to specify at runtime
4. Add charts to the template:
   - Click "Add Chart" to add a new chart
   - Configure each chart with:
     - **Chart Type**: Bar, Line, Pie, or Table
     - **Chart Title**: Title for the chart
     - **Chart-specific configuration**: Axes, columns, filters, etc.
5. Click "Save Template"

## Using Templates

To use a template to generate a report:

1. Find the template in the Templates page
2. Click the "Use" button (play icon)
3. Fill in the report details:
   - **Report Title**: Title for the generated report
   - **Parameters**: Any runtime parameters required by the template
4. Click "Create Report"
5. The report will be generated and displayed

## Managing Templates

### Viewing Template Details

To view details of a template:

1. Click the "Details" button (info icon) next to the template
2. The template details modal will show:
   - Basic information about the template
   - Data source configuration
   - Chart configurations
   - Sample data (can be generated on demand)

### Editing Templates

To edit a template:

1. Click the "Edit" button (pencil icon) next to the template
2. Modify the template details, data source, or charts
3. Click "Update"

### Cloning Templates

To clone a template:

1. Open the template details modal
2. Click "Actions" > "Clone Template"
3. Enter a name for the cloned template
4. Click "OK"

### Deleting Templates

To delete a template:

1. Click the "Edit" button (pencil icon) next to the template
2. Click "Delete" in the edit modal
3. Confirm the deletion

## Sample Data

You can generate sample data to preview how a template will work:

1. Open the template details modal
2. Click "Generate Sample Data"
3. Sample data will be generated based on the template configuration

## Template Structure

A template consists of:

1. **Metadata**:
   - Name
   - Description
   - Tags
   - Creation and update timestamps

2. **Data Source Configuration**:
   - Source type (file, API, database)
   - Source-specific settings (file type, file name, etc.)

3. **Chart Configurations**:
   - One or more chart definitions
   - Each chart has:
     - Type (bar, line, pie, table)
     - Title
     - Chart-specific settings (axes, columns, filters, etc.)
     - Dimensions

## Chart Types

### Bar Chart

- **X-Axis Column**: Column to use for the X-axis
- **Y-Axis Column(s)**: One or more columns to use for the Y-axis

### Line Chart

- **X-Axis Column**: Column to use for the X-axis (typically a date or time)
- **Y-Axis Column(s)**: One or more columns to use for the Y-axis

### Pie Chart

- **Labels Column**: Column to use for slice labels
- **Values Column**: Column to use for slice values

### Table

- **Columns**: Columns to include in the table
- **Filter**: Optional JavaScript expression to filter rows
- **Row Limit**: Maximum number of rows to include

## Programmatic API

You can also use the ReportTemplate class in your code:

```javascript
const { ReportTemplate } = require('../utils/scheduler');

// Initialize report template manager
const reportTemplate = new ReportTemplate();

// Create a template
const templateId = reportTemplate.createTemplate({
  name: 'My Template',
  description: 'A sample template',
  tags: ['sales', 'monthly'],
  dataSource: {
    type: 'file',
    fileType: 'json',
    fileName: 'data.json'
  },
  charts: [
    {
      type: 'bar',
      title: 'Sales by Product',
      xAxis: 'product',
      yAxis: ['sales'],
      dimensions: {
        width: 800,
        height: 400
      }
    }
  ]
});

// Get all templates
const templates = reportTemplate.getTemplates();

// Get a specific template
const template = reportTemplate.getTemplate(templateId);

// Update a template
reportTemplate.updateTemplate(templateId, {
  name: 'Updated Template Name'
});

// Clone a template
const newId = reportTemplate.cloneTemplate(templateId, 'Cloned Template');

// Delete a template
reportTemplate.deleteTemplate(templateId);

// Create a report from a template
const reportConfig = reportTemplate.createReportFromTemplate(templateId, {
  title: 'My Report',
  dataSource: {
    fileName: 'new-data.json'
  }
});

// Generate sample data for a template
const sampleData = reportTemplate.generateSampleData(templateId, 10);
```

## Best Practices

1. **Use descriptive names** for templates to easily identify them
2. **Add tags** to organize templates by purpose, department, or frequency
3. **Provide clear descriptions** to help others understand the template's purpose
4. **Use parameters** for values that might change between reports
5. **Test templates** with sample data before using them for real reports
6. **Clone templates** instead of creating new ones from scratch when possible
7. **Standardize chart types** for similar data across different reports

## Integration with Scheduled Reports

You can use templates with scheduled reports:

1. Create a template with the desired charts and configuration
2. When creating a scheduled report, select "Use Template" and choose your template
3. Configure the schedule and recipients
4. The report will be generated from the template according to the schedule

This integration makes it easy to maintain consistent reporting formats across scheduled reports.