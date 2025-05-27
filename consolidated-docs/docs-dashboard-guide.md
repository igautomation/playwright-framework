<!-- Source: /Users/mzahirudeen/playwright-framework/docs/dashboard-guide.md -->

# Dashboard Guide

This guide explains how to use the interactive dashboard for visualizing scraped data.

## Overview

The dashboard provides a user-friendly web interface for exploring and visualizing data collected through the web scraping tools. It allows you to:

- Browse and explore scraped data files
- Create visualizations from your data
- Generate comprehensive reports
- Analyze data patterns and statistics

## Getting Started

### Starting the Dashboard

You can start the dashboard using the CLI tool:

```bash
# Start the dashboard on the default port (3000)
dashboard

# Start the dashboard on a specific port
dashboard --port 8080

# Start the dashboard and open it in your browser
dashboard --open
```

Once started, you can access the dashboard by opening your browser and navigating to:

```
http://localhost:3000
```

### Dashboard Layout

The dashboard consists of several main sections:

1. **Home**: Overview of your data and recent activity
2. **Data Explorer**: Browse and analyze your scraped data files
3. **Visualize**: Create charts and visualizations from your data
4. **Reports**: View and manage generated reports

## Data Explorer

The Data Explorer allows you to browse and analyze your scraped data files.

### Features

- **File Browser**: Browse JSON, CSV, and uploaded files
- **Data Preview**: View the contents of your data files
- **Data Analysis**: Generate statistics and insights from your data
- **Visualization**: Create charts directly from your data

### Using Data Explorer

1. Select a file from the file browser
2. Preview the data in the data preview panel
3. Click "Analyze" to perform statistical analysis
4. Select a column and analysis type to generate insights
5. Generate charts from your analysis results

## Visualize

The Visualize section allows you to create custom visualizations from your data.

### Available Chart Types

- **Bar Charts**: Compare values across categories
- **Line Charts**: Show trends over time
- **Pie Charts**: Display proportions of a whole
- **Tables**: Present data in a tabular format

### Creating a Visualization

1. Select a data source
2. Choose a chart type
3. Configure chart options (axes, labels, colors)
4. Generate and preview the chart
5. Save or export the chart

## Reports

The Reports section allows you to view and manage generated reports.

### Report Features

- **Multiple Charts**: Include multiple visualizations in a single report
- **Custom Layout**: Arrange charts in a custom layout
- **Interactive Elements**: Include interactive elements in your reports
- **Export Options**: Export reports in various formats

### Creating a Report

1. Select "Create Report" from the sidebar
2. Add charts to your report
3. Configure report layout and options
4. Generate and preview the report
5. Save or export the report

## Data Upload

You can upload your own data files to the dashboard for visualization.

### Supported File Formats

- **JSON**: For structured data
- **CSV**: For tabular data

### Uploading Data

1. Click "Upload Data" in the sidebar
2. Select a file from your computer
3. Click "Upload"
4. Your file will be available in the "Uploads" tab of the Data Explorer

## Integration with Web Scraping

The dashboard integrates seamlessly with the web scraping tools:

1. **Scrape data** using the CLI tool or programmatic API
2. **Explore the data** in the Data Explorer
3. **Create visualizations** to gain insights
4. **Generate reports** to share your findings

## Example Workflow

```bash
# 1. Scrape data from a website
scrape table https://example.com/products "#products-table" -o products.json

# 2. Start the dashboard
dashboard --open

# 3. In the dashboard:
# - Navigate to Data Explorer
# - Select products.json
# - Analyze the data
# - Create visualizations
# - Generate a report
```

## Advanced Features

### Real-time Updates

The dashboard uses Socket.IO for real-time updates. When new data is scraped or new visualizations are created, the dashboard will update automatically.

### Custom Themes

You can customize the appearance of the dashboard by modifying the CSS files in the `src/dashboard/public/css` directory.

### API Integration

The dashboard provides a REST API that you can use to integrate with other tools and services:

- `/api/data/:type/:filename`: Get data from a file
- `/api/visualize`: Generate a visualization
- `/api/analyze`: Analyze data
- `/api/generate-report`: Generate a report

## Troubleshooting

### Dashboard Won't Start

- Check if the port is already in use
- Ensure all dependencies are installed
- Check the logs for error messages

### Visualizations Not Loading

- Check if the data file exists
- Ensure the data format is correct
- Check the browser console for error messages

### Report Generation Fails

- Check if the chart configurations are valid
- Ensure the output directory is writable
- Check the logs for error messages