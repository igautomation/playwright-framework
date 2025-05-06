#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { ChartGenerator, DataAnalyzer } = require('../utils/visualization');
const { DataProvider } = require('../utils/web');
const logger = require('../utils/common/logger');

// Configure CLI
program
  .name('visualize')
  .description('CLI tool for visualizing scraped data')
  .version('1.0.0');

// Common options
const addCommonOptions = (command) => {
  return command
    .option('-o, --output <path>', 'Output file path (without extension)')
    .option('-w, --width <pixels>', 'Chart width in pixels', '800')
    .option('-h, --height <pixels>', 'Chart height in pixels', '600')
    .option('--output-dir <path>', 'Output directory for charts', path.resolve(process.cwd(), 'reports/charts'))
    .option('--data-dir <path>', 'Data directory for input files', path.resolve(process.cwd(), 'data/extracted'));
};

// Bar chart command
program
  .command('bar')
  .description('Generate a bar chart from data')
  .argument('<file>', 'Input data file (JSON or CSV)')
  .requiredOption('-x, --x-axis <column>', 'Column to use for X-axis labels')
  .requiredOption('-y, --y-axis <columns>', 'Column(s) to use for Y-axis values (comma-separated)')
  .option('-t, --title <title>', 'Chart title')
  .action(async (file, options) => {
    await generateBarChart(file, options);
  });

addCommonOptions(program.commands[0]);

// Line chart command
program
  .command('line')
  .description('Generate a line chart from data')
  .argument('<file>', 'Input data file (JSON or CSV)')
  .requiredOption('-x, --x-axis <column>', 'Column to use for X-axis labels')
  .requiredOption('-y, --y-axis <columns>', 'Column(s) to use for Y-axis values (comma-separated)')
  .option('-t, --title <title>', 'Chart title')
  .action(async (file, options) => {
    await generateLineChart(file, options);
  });

addCommonOptions(program.commands[1]);

// Pie chart command
program
  .command('pie')
  .description('Generate a pie chart from data')
  .argument('<file>', 'Input data file (JSON or CSV)')
  .requiredOption('-l, --labels <column>', 'Column to use for pie slice labels')
  .requiredOption('-v, --values <column>', 'Column to use for pie slice values')
  .option('-t, --title <title>', 'Chart title')
  .action(async (file, options) => {
    await generatePieChart(file, options);
  });

addCommonOptions(program.commands[2]);

// Table image command
program
  .command('table')
  .description('Generate a table image from data')
  .argument('<file>', 'Input data file (JSON or CSV)')
  .option('-c, --columns <columns>', 'Columns to include (comma-separated)')
  .option('-t, --title <title>', 'Table title')
  .option('-l, --limit <rows>', 'Limit number of rows', '50')
  .action(async (file, options) => {
    await generateTableImage(file, options);
  });

addCommonOptions(program.commands[3]);

// Report command
program
  .command('report')
  .description('Generate a report with multiple charts')
  .argument('<file>', 'Input data file (JSON or CSV)')
  .requiredOption('-c, --config <file>', 'Report configuration file (JSON)')
  .option('-t, --title <title>', 'Report title')
  .action(async (file, options) => {
    await generateReport(file, options);
  });

addCommonOptions(program.commands[4]);

// Stats command
program
  .command('stats')
  .description('Generate statistics for data')
  .argument('<file>', 'Input data file (JSON or CSV)')
  .option('-c, --columns <columns>', 'Columns to analyze (comma-separated)')
  .option('-o, --output <file>', 'Output file for statistics (JSON)')
  .action(async (file, options) => {
    await generateStats(file, options);
  });

addCommonOptions(program.commands[5]);

// Parse command line arguments
program.parse();

// Helper function to load data
async function loadData(file, dataDir) {
  try {
    const dataProvider = new DataProvider({
      dataDir
    });
    
    // Determine file path
    let filepath = file;
    if (!path.isAbsolute(file)) {
      if (file.includes('/') || file.includes('\\')) {
        filepath = path.resolve(process.cwd(), file);
      } else {
        filepath = file;
      }
    }
    
    logger.info(`Loading data from: ${filepath}`);
    return dataProvider.loadData(filepath);
  } catch (error) {
    logger.error(`Failed to load data from: ${file}`, error);
    throw error;
  }
}

// Implementation of visualization commands
async function generateBarChart(file, options) {
  try {
    // Load data
    const data = await loadData(file, options.dataDir);
    
    // Parse options
    const xAxis = options.xAxis;
    const yAxis = options.yAxis.split(',').map(col => col.trim());
    const title = options.title || `Bar Chart - ${file}`;
    const outputFile = options.output || `bar-chart-${Date.now()}`;
    const width = parseInt(options.width, 10);
    const height = parseInt(options.height, 10);
    
    // Prepare chart data
    const analyzer = new DataAnalyzer();
    const chartData = analyzer.prepareChartData(data, xAxis, yAxis, 'bar');
    
    // Generate chart
    const chartGenerator = new ChartGenerator({
      width,
      height,
      outputDir: options.outputDir
    });
    
    const chartConfig = {
      title,
      labels: chartData.labels,
      datasets: chartData.datasets
    };
    
    const chartPath = await chartGenerator.generateBarChart(chartConfig, outputFile);
    
    logger.info(`Bar chart generated: ${chartPath}`);
    console.log(`Chart saved to: ${chartPath}`);
  } catch (error) {
    logger.error('Failed to generate bar chart', error);
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function generateLineChart(file, options) {
  try {
    // Load data
    const data = await loadData(file, options.dataDir);
    
    // Parse options
    const xAxis = options.xAxis;
    const yAxis = options.yAxis.split(',').map(col => col.trim());
    const title = options.title || `Line Chart - ${file}`;
    const outputFile = options.output || `line-chart-${Date.now()}`;
    const width = parseInt(options.width, 10);
    const height = parseInt(options.height, 10);
    
    // Prepare chart data
    const analyzer = new DataAnalyzer();
    const chartData = analyzer.prepareChartData(data, xAxis, yAxis, 'line');
    
    // Generate chart
    const chartGenerator = new ChartGenerator({
      width,
      height,
      outputDir: options.outputDir
    });
    
    const chartConfig = {
      title,
      labels: chartData.labels,
      datasets: chartData.datasets
    };
    
    const chartPath = await chartGenerator.generateLineChart(chartConfig, outputFile);
    
    logger.info(`Line chart generated: ${chartPath}`);
    console.log(`Chart saved to: ${chartPath}`);
  } catch (error) {
    logger.error('Failed to generate line chart', error);
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function generatePieChart(file, options) {
  try {
    // Load data
    const data = await loadData(file, options.dataDir);
    
    // Parse options
    const labels = options.labels;
    const values = options.values;
    const title = options.title || `Pie Chart - ${file}`;
    const outputFile = options.output || `pie-chart-${Date.now()}`;
    const width = parseInt(options.width, 10);
    const height = parseInt(options.height, 10);
    
    // Prepare chart data
    const analyzer = new DataAnalyzer();
    const chartData = analyzer.prepareChartData(data, labels, values, 'pie');
    
    // Generate chart
    const chartGenerator = new ChartGenerator({
      width,
      height,
      outputDir: options.outputDir
    });
    
    const chartConfig = {
      title,
      labels: chartData.labels,
      data: chartData.data,
      backgroundColor: chartData.backgroundColor
    };
    
    const chartPath = await chartGenerator.generatePieChart(chartConfig, outputFile);
    
    logger.info(`Pie chart generated: ${chartPath}`);
    console.log(`Chart saved to: ${chartPath}`);
  } catch (error) {
    logger.error('Failed to generate pie chart', error);
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function generateTableImage(file, options) {
  try {
    // Load data
    const data = await loadData(file, options.dataDir);
    
    // Parse options
    const columns = options.columns ? options.columns.split(',').map(col => col.trim()) : null;
    const title = options.title || `Table - ${file}`;
    const outputFile = options.output || `table-${Date.now()}`;
    const width = parseInt(options.width, 10);
    const height = parseInt(options.height, 10);
    const limit = parseInt(options.limit, 10);
    
    // Limit rows if needed
    const limitedData = limit > 0 && data.length > limit ? data.slice(0, limit) : data;
    
    // Generate table image
    const chartGenerator = new ChartGenerator({
      width,
      height,
      outputDir: options.outputDir
    });
    
    const tablePath = await chartGenerator.generateTableImage(
      limitedData,
      { columns, title },
      outputFile
    );
    
    logger.info(`Table image generated: ${tablePath}`);
    console.log(`Table image saved to: ${tablePath}`);
  } catch (error) {
    logger.error('Failed to generate table image', error);
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function generateReport(file, options) {
  try {
    // Load data
    const data = await loadData(file, options.dataDir);
    
    // Load report configuration
    const configPath = path.resolve(process.cwd(), options.config);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Report configuration file not found: ${configPath}`);
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    // Parse options
    const title = options.title || config.title || `Report - ${file}`;
    const outputFile = options.output || `report-${Date.now()}`;
    
    // Create chart generator
    const chartGenerator = new ChartGenerator({
      outputDir: options.outputDir
    });
    
    // Create data analyzer
    const analyzer = new DataAnalyzer();
    
    // Process chart configurations
    const charts = [];
    
    for (const chartConfig of config.charts) {
      const chartType = chartConfig.type;
      const chartTitle = chartConfig.title;
      
      if (chartType === 'table') {
        // Handle table
        const tableData = chartConfig.filter
          ? analyzer.filter(data, new Function('item', `return ${chartConfig.filter}`))
          : data;
        
        charts.push({
          type: 'table',
          title: chartTitle,
          data: tableData,
          options: {
            columns: chartConfig.columns,
            title: chartTitle
          },
          dimensions: chartConfig.dimensions
        });
      } else {
        // Handle charts (bar, line, pie)
        let chartData;
        
        if (chartType === 'pie') {
          chartData = analyzer.prepareChartData(
            data,
            chartConfig.labels,
            chartConfig.values,
            'pie'
          );
          
          charts.push({
            type: 'pie',
            title: chartTitle,
            config: {
              title: chartTitle,
              labels: chartData.labels,
              data: chartData.data,
              backgroundColor: chartData.backgroundColor
            },
            dimensions: chartConfig.dimensions
          });
        } else {
          chartData = analyzer.prepareChartData(
            data,
            chartConfig.xAxis,
            chartConfig.yAxis,
            chartType
          );
          
          charts.push({
            type: chartType,
            title: chartTitle,
            config: {
              title: chartTitle,
              labels: chartData.labels,
              datasets: chartData.datasets
            },
            dimensions: chartConfig.dimensions
          });
        }
      }
    }
    
    // Generate report
    const reportPath = await chartGenerator.generateReport(charts, outputFile);
    
    logger.info(`Report generated: ${reportPath}`);
    console.log(`Report saved to: ${reportPath}`);
  } catch (error) {
    logger.error('Failed to generate report', error);
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function generateStats(file, options) {
  try {
    // Load data
    const data = await loadData(file, options.dataDir);
    
    // Parse options
    const columns = options.columns
      ? options.columns.split(',').map(col => col.trim())
      : Object.keys(data[0]);
    
    const outputFile = options.output || `stats-${path.basename(file, path.extname(file))}.json`;
    
    // Generate statistics
    const analyzer = new DataAnalyzer();
    const stats = {};
    
    for (const column of columns) {
      try {
        // Try to calculate numeric stats
        stats[column] = analyzer.calculateStats(data, column);
      } catch (error) {
        // If not numeric, calculate frequency distribution
        stats[column] = analyzer.frequencyDistribution(data, column);
      }
    }
    
    // Save statistics
    const outputPath = path.resolve(process.cwd(), outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
    
    logger.info(`Statistics generated: ${outputPath}`);
    console.log(`Statistics saved to: ${outputPath}`);
    console.log(stats);
  } catch (error) {
    logger.error('Failed to generate statistics', error);
    console.error('Error:', error.message);
    process.exit(1);
  }
}