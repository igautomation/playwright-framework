# Data Visualization Guide

This guide explains how to use the data visualization tools in the Playwright framework.

## Overview

The framework provides tools for visualizing scraped data:

1. **CLI Tool**: For generating charts and reports from the command line
2. **Programmatic API**: For integrating visualization into your tests and scripts

## CLI Tool

### Installation

The CLI tool is included with the framework. Make sure you have all dependencies installed:

```bash
npm install
```

Make the CLI tool executable:

```bash
node scripts/make-visualize-executable.js
```

### Basic Usage

```bash
visualize [command] [options]
```

### Available Commands

#### Bar Chart

Generate a bar chart from data:

```bash
visualize bar data/extracted/json/products.json -x Name -y Price,Rating -t "Product Comparison"
```

#### Line Chart

Generate a line chart from data:

```bash
visualize line data/extracted/json/sales.json -x Month -y "2022,2023" -t "Sales Comparison"
```

#### Pie Chart

Generate a pie chart from data:

```bash
visualize pie data/extracted/json/categories.json -l Category -v Count -t "Category Distribution"
```

#### Table Image

Generate a table image from data:

```bash
visualize table data/extracted/json/users.json -c "Name,Email,Role" -t "User List"
```

#### Report

Generate a report with multiple charts:

```bash
visualize report data/extracted/json/products.json -c report-config.json -t "Product Analysis"
```

#### Statistics

Generate statistics for data:

```bash
visualize stats data/extracted/json/products.json -c "Price,Rating,Stock"
```

### Common Options

All commands support the following options:

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <path>` | Output file path | Auto-generated |
| `-w, --width <pixels>` | Chart width in pixels | `800` |
| `-h, --height <pixels>` | Chart height in pixels | `600` |
| `--output-dir <path>` | Output directory for charts | `./reports/charts` |
| `--data-dir <path>` | Data directory for input files | `./data/extracted` |

### Report Configuration

To generate a report with multiple charts, create a JSON configuration file:

```json
{
  "title": "Product Analysis Report",
  "charts": [
    {
      "type": "bar",
      "title": "Product Prices",
      "xAxis": "Name",
      "yAxis": ["Price"],
      "dimensions": {
        "width": 800,
        "height": 400
      }
    },
    {
      "type": "pie",
      "title": "Category Distribution",
      "labels": "Category",
      "values": "Count",
      "dimensions": {
        "width": 600,
        "height": 600
      }
    },
    {
      "type": "table",
      "title": "Top Products",
      "columns": ["Name", "Price", "Rating", "Stock"],
      "filter": "item.Rating > 4.5",
      "dimensions": {
        "width": 800,
        "height": 400
      }
    }
  ]
}
```

## Programmatic API

### ChartGenerator

The `ChartGenerator` class provides methods for generating charts and reports:

```javascript
const { ChartGenerator } = require('../../utils/visualization');

// Initialize chart generator
const chartGenerator = new ChartGenerator({
  width: 800,
  height: 600,
  outputDir: './reports/charts'
});

// Generate a bar chart
const barChartPath = await chartGenerator.generateBarChart({
  title: 'Product Prices',
  labels: ['Product A', 'Product B', 'Product C'],
  datasets: [{
    label: 'Price',
    data: [10, 20, 15],
    backgroundColor: '#36A2EB'
  }]
}, 'product-prices');

// Generate a pie chart
const pieChartPath = await chartGenerator.generatePieChart({
  title: 'Category Distribution',
  labels: ['Category A', 'Category B', 'Category C'],
  data: [30, 50, 20]
}, 'category-distribution');

// Generate a table image
const tablePath = await chartGenerator.generateTableImage([
  { name: 'Product A', price: 10, rating: 4.5 },
  { name: 'Product B', price: 20, rating: 4.8 },
  { name: 'Product C', price: 15, rating: 4.2 }
], {
  title: 'Product List',
  columns: ['name', 'price', 'rating']
}, 'product-table');

// Generate a report with multiple charts
const reportPath = await chartGenerator.generateReport([
  {
    type: 'bar',
    title: 'Product Prices',
    config: {
      title: 'Product Prices',
      labels: ['Product A', 'Product B', 'Product C'],
      datasets: [{
        label: 'Price',
        data: [10, 20, 15],
        backgroundColor: '#36A2EB'
      }]
    }
  },
  {
    type: 'pie',
    title: 'Category Distribution',
    config: {
      title: 'Category Distribution',
      labels: ['Category A', 'Category B', 'Category C'],
      data: [30, 50, 20]
    }
  }
], 'product-analysis');
```

### DataAnalyzer

The `DataAnalyzer` class provides methods for analyzing and preparing data for visualization:

```javascript
const { DataAnalyzer } = require('../../utils/visualization');

// Initialize data analyzer
const analyzer = new DataAnalyzer();

// Extract a column from data
const prices = analyzer.extractColumn(products, 'price');

// Count values in a column
const categoryCounts = analyzer.countValues(products, 'category');

// Calculate statistics for a column
const priceStats = analyzer.calculateStats(products, 'price');
console.log(`Average price: ${priceStats.mean}`);
console.log(`Price range: ${priceStats.min} - ${priceStats.max}`);

// Group data by a column
const productsByCategory = analyzer.groupBy(products, 'category');

// Filter data
const premiumProducts = analyzer.filter(products, item => item.price > 100);

// Sort data
const sortedProducts = analyzer.sort(products, 'price', false); // descending

// Find top values
const topProducts = analyzer.findTopValues(products, 'rating', 5);

// Calculate frequency distribution
const categoryDistribution = analyzer.frequencyDistribution(products, 'category');

// Prepare data for charts
const barChartData = analyzer.prepareChartData(
  products,
  'name',
  ['price', 'rating'],
  'bar'
);
```

## Integration with Web Scraping

### Example: Scrape and Visualize

```javascript
const { test } = require('@playwright/test');
const { WebScrapingUtils } = require('../../utils/web');
const { ChartGenerator, DataAnalyzer } = require('../../utils/visualization');
const { DataProvider } = require('../../utils/web');

test('Scrape and visualize product data', async ({ page }) => {
  // Scrape data
  await page.goto('https://example.com/products');
  
  const scraper = new WebScrapingUtils(page);
  const products = await scraper.extractTableData('#products-table');
  
  // Save scraped data
  const dataProvider = new DataProvider();
  const dataPath = dataProvider.saveAsJson(products, 'products');
  
  // Analyze data
  const analyzer = new DataAnalyzer();
  const priceStats = analyzer.calculateStats(products, 'price');
  const categoryDistribution = analyzer.frequencyDistribution(products, 'category');
  
  // Prepare chart data
  const barChartData = analyzer.prepareChartData(products, 'name', 'price', 'bar');
  const pieChartData = {
    labels: Object.keys(categoryDistribution.counts),
    data: Object.values(categoryDistribution.counts)
  };
  
  // Generate charts
  const chartGenerator = new ChartGenerator();
  
  await chartGenerator.generateBarChart({
    title: 'Product Prices',
    labels: barChartData.labels,
    datasets: barChartData.datasets
  }, 'product-prices');
  
  await chartGenerator.generatePieChart({
    title: 'Category Distribution',
    labels: pieChartData.labels,
    data: pieChartData.data
  }, 'category-distribution');
  
  // Generate report
  await chartGenerator.generateReport([
    {
      type: 'bar',
      title: 'Product Prices',
      config: {
        title: 'Product Prices',
        labels: barChartData.labels,
        datasets: barChartData.datasets
      }
    },
    {
      type: 'pie',
      title: 'Category Distribution',
      config: {
        title: 'Category Distribution',
        labels: pieChartData.labels,
        data: pieChartData.data
      }
    },
    {
      type: 'table',
      title: 'Top Rated Products',
      data: analyzer.findTopValues(products, 'rating', 5),
      options: {
        columns: ['name', 'price', 'rating', 'category']
      }
    }
  ], 'product-analysis');
});
```

## Best Practices

1. **Data Preparation**: Clean and normalize data before visualization
2. **Chart Selection**: Choose the appropriate chart type for your data
3. **Color Schemes**: Use consistent color schemes for better readability
4. **Labels and Titles**: Provide clear labels and titles for charts
5. **Responsive Design**: Consider different screen sizes when setting dimensions
6. **Data Filtering**: Filter out irrelevant data before visualization
7. **Automation**: Integrate visualization into your CI/CD pipeline