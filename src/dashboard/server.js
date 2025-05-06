const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { DataProvider } = require('../utils/web');
const { ChartGenerator, DataAnalyzer } = require('../utils/visualization');
const { ReportScheduler, ReportHistory, ReportTemplate } = require('../utils/scheduler');
const logger = require('../utils/common/logger');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/charts', express.static(path.join(process.cwd(), 'reports/charts')));
app.use('/data', express.static(path.join(process.cwd(), 'data/extracted')));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'data/extracted/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Initialize data provider and analyzer
const dataProvider = new DataProvider();
const dataAnalyzer = new DataAnalyzer();
const chartGenerator = new ChartGenerator({
  outputDir: path.join(process.cwd(), 'reports/charts/dashboard')
});

// Initialize report scheduler, history, and templates
const reportScheduler = new ReportScheduler({
  schedulesDir: path.join(process.cwd(), 'data/schedules'),
  reportsDir: path.join(process.cwd(), 'reports/charts/scheduled')
});

const reportHistory = new ReportHistory({
  historyDir: path.join(process.cwd(), 'data/history'),
  reportsDir: path.join(process.cwd(), 'reports/charts'),
  maxHistoryAge: 90 // Keep reports for 90 days
});

const reportTemplate = new ReportTemplate({
  templatesDir: path.join(process.cwd(), 'data/templates')
});

// Ensure output directories exist
const outputDirs = [
  path.join(process.cwd(), 'reports/charts/dashboard'),
  path.join(process.cwd(), 'data/extracted/uploads'),
  path.join(process.cwd(), 'data/templates')
];

outputDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Data Visualization Dashboard'
  });
});

app.get('/schedules', (req, res) => {
  res.render('schedules', {
    title: 'Scheduled Reports'
  });
});

app.get('/history', (req, res) => {
  res.render('history', {
    title: 'Report History'
  });
});

app.get('/templates', (req, res) => {
  res.render('templates', {
    title: 'Report Templates'
  });
});

app.get('/data-explorer', async (req, res) => {
  try {
    // Get list of available data files
    const jsonDir = path.join(process.cwd(), 'data/extracted/json');
    const csvDir = path.join(process.cwd(), 'data/extracted/csv');
    const uploadDir = path.join(process.cwd(), 'data/extracted/uploads');
    
    const jsonFiles = fs.existsSync(jsonDir) 
      ? fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'))
      : [];
      
    const csvFiles = fs.existsSync(csvDir)
      ? fs.readdirSync(csvDir).filter(file => file.endsWith('.csv'))
      : [];
      
    const uploadFiles = fs.existsSync(uploadDir)
      ? fs.readdirSync(uploadDir)
      : [];
    
    res.render('data-explorer', {
      title: 'Data Explorer',
      jsonFiles,
      csvFiles,
      uploadFiles
    });
  } catch (error) {
    logger.error('Error in data explorer route', error);
    res.status(500).send('Error loading data files');
  }
});

app.get('/visualize', (req, res) => {
  res.render('visualize', {
    title: 'Create Visualizations'
  });
});

app.get('/reports', async (req, res) => {
  try {
    const reportsDir = path.join(process.cwd(), 'reports/charts');
    
    // Get list of report directories (each containing an index.html)
    const reportDirs = fs.existsSync(reportsDir)
      ? fs.readdirSync(reportsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(dir => {
          const indexPath = path.join(reportsDir, dir, 'index.html');
          return fs.existsSync(indexPath);
        })
      : [];
    
    res.render('reports', {
      title: 'Reports',
      reports: reportDirs
    });
  } catch (error) {
    logger.error('Error in reports route', error);
    res.status(500).send('Error loading reports');
  }
});

// API Routes
app.get('/api/data/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;
    let filePath;
    
    if (type === 'json') {
      filePath = path.join(process.cwd(), 'data/extracted/json', filename);
    } else if (type === 'csv') {
      filePath = path.join(process.cwd(), 'data/extracted/csv', filename);
    } else if (type === 'upload') {
      filePath = path.join(process.cwd(), 'data/extracted/uploads', filename);
    } else {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    let data;
    if (filePath.endsWith('.json')) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else if (filePath.endsWith('.csv')) {
      // Use data provider to load CSV
      data = dataProvider.loadFromCsv(filePath);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }
    
    res.json({ data });
  } catch (error) {
    logger.error('Error in data API route', error);
    res.status(500).json({ error: 'Error loading data' });
  }
});

// API route to get list of files
app.get('/api/files/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let dirPath;
    
    if (type === 'json') {
      dirPath = path.join(process.cwd(), 'data/extracted/json');
    } else if (type === 'csv') {
      dirPath = path.join(process.cwd(), 'data/extracted/csv');
    } else if (type === 'upload') {
      dirPath = path.join(process.cwd(), 'data/extracted/uploads');
    } else {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    if (!fs.existsSync(dirPath)) {
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(dirPath)
      .filter(file => {
        if (type === 'json') return file.endsWith('.json');
        if (type === 'csv') return file.endsWith('.csv');
        return true;
      });
    
    res.json({ files });
  } catch (error) {
    logger.error('Error in files API route', error);
    res.status(500).json({ error: 'Error listing files' });
  }
});

app.post('/api/upload', upload.single('dataFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileName = req.file.filename;
    
    res.json({
      success: true,
      file: {
        name: fileName,
        path: filePath
      }
    });
  } catch (error) {
    logger.error('Error uploading file', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

app.post('/api/visualize', async (req, res) => {
  try {
    const { type, data, options } = req.body;
    
    if (!type || !data || !options) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const timestamp = Date.now();
    const filename = `${type}-chart-${timestamp}`;
    let chartPath;
    
    switch (type) {
      case 'bar':
        chartPath = await chartGenerator.generateBarChart({
          title: options.title || 'Bar Chart',
          labels: data.labels,
          datasets: data.datasets
        }, filename);
        break;
      case 'line':
        chartPath = await chartGenerator.generateLineChart({
          title: options.title || 'Line Chart',
          labels: data.labels,
          datasets: data.datasets
        }, filename);
        break;
      case 'pie':
        chartPath = await chartGenerator.generatePieChart({
          title: options.title || 'Pie Chart',
          labels: data.labels,
          data: data.data,
          backgroundColor: data.backgroundColor
        }, filename);
        break;
      case 'table':
        chartPath = await chartGenerator.generateTableImage(
          data,
          {
            title: options.title || 'Table',
            columns: options.columns
          },
          filename
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid chart type' });
    }
    
    // Get relative path for client
    const relativePath = path.relative(
      path.join(process.cwd(), 'reports/charts'),
      chartPath
    );
    
    res.json({
      success: true,
      chart: {
        path: `/charts/${relativePath.replace(/\\/g, '/')}`,
        type
      }
    });
  } catch (error) {
    logger.error('Error generating visualization', error);
    res.status(500).json({ error: 'Error generating visualization' });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { data, column, operation } = req.body;
    
    if (!data || !column || !operation) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    let result;
    
    switch (operation) {
      case 'stats':
        result = dataAnalyzer.calculateStats(data, column);
        break;
      case 'frequency':
        result = dataAnalyzer.frequencyDistribution(data, column);
        break;
      case 'top':
        const count = req.body.count || 5;
        result = dataAnalyzer.findTopValues(data, column, count);
        break;
      case 'group':
        result = dataAnalyzer.groupBy(data, column);
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
    
    res.json({ result });
  } catch (error) {
    logger.error('Error analyzing data', error);
    res.status(500).json({ error: 'Error analyzing data' });
  }
});

app.post('/api/generate-report', async (req, res) => {
  try {
    const { charts, title } = req.body;
    
    if (!charts || !Array.isArray(charts)) {
      return res.status(400).json({ error: 'Missing or invalid charts parameter' });
    }
    
    const reportTitle = title || `Report-${Date.now()}`;
    const reportPath = await chartGenerator.generateReport(charts, reportTitle);
    
    // Get relative path for client
    const relativePath = path.relative(
      path.join(process.cwd(), 'reports/charts'),
      reportPath
    );
    
    res.json({
      success: true,
      report: {
        path: `/charts/${path.dirname(relativePath).replace(/\\/g, '/')}`,
        title: reportTitle
      }
    });
  } catch (error) {
    logger.error('Error generating report', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

// Schedules API routes
app.get('/api/schedules', (req, res) => {
  try {
    const schedules = reportScheduler.getAllSchedules();
    res.json({ schedules });
  } catch (error) {
    logger.error('Error getting schedules', error);
    res.status(500).json({ error: 'Error getting schedules' });
  }
});

app.get('/api/schedules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const schedule = reportScheduler.getSchedule(id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ schedule });
  } catch (error) {
    logger.error(`Error getting schedule: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error getting schedule' });
  }
});

app.post('/api/schedules', (req, res) => {
  try {
    const schedule = req.body;
    const id = reportScheduler.scheduleReport(schedule);
    res.json({ id, success: true });
  } catch (error) {
    logger.error('Error creating schedule', error);
    res.status(500).json({ error: 'Error creating schedule' });
  }
});

app.put('/api/schedules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const schedule = reportScheduler.updateSchedule(id, updates);
    res.json({ schedule });
  } catch (error) {
    logger.error(`Error updating schedule: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error updating schedule' });
  }
});

app.delete('/api/schedules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = reportScheduler.deleteSchedule(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ success });
  } catch (error) {
    logger.error(`Error deleting schedule: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error deleting schedule' });
  }
});

app.post('/api/schedules/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    const reportPath = await reportScheduler.runScheduleNow(id);
    
    // Get relative path for client
    const relativePath = path.relative(
      path.join(process.cwd(), 'reports/charts'),
      reportPath
    );
    
    res.json({ 
      success: true, 
      reportPath: `/charts/${path.dirname(relativePath).replace(/\\/g, '/')}` 
    });
  } catch (error) {
    logger.error(`Error running schedule: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error running schedule' });
  }
});

// Report History API routes
app.get('/api/history', (req, res) => {
  try {
    const { 
      scheduleId, 
      search, 
      startDate, 
      endDate, 
      tags,
      limit = 20, 
      offset = 0 
    } = req.query;
    
    // Parse tags if provided
    const parsedTags = tags ? tags.split(',') : undefined;
    
    const result = reportHistory.getReports({
      scheduleId,
      search,
      startDate,
      endDate,
      tags: parsedTags,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Error getting report history', error);
    res.status(500).json({ error: 'Error getting report history' });
  }
});

app.get('/api/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    const report = reportHistory.getReport(id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ report });
  } catch (error) {
    logger.error(`Error getting report: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error getting report' });
  }
});

app.delete('/api/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { deleteFile } = req.query;
    
    const success = reportHistory.deleteReport(id, deleteFile === 'true');
    
    if (!success) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ success });
  } catch (error) {
    logger.error(`Error deleting report: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error deleting report' });
  }
});

app.post('/api/history/:id/tags', (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;
    
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }
    
    const success = reportHistory.addTags(id, tags);
    
    if (!success) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ success });
  } catch (error) {
    logger.error(`Error adding tags to report: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error adding tags to report' });
  }
});

app.delete('/api/history/:id/tags', (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;
    
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }
    
    const success = reportHistory.removeTags(id, tags);
    
    if (!success) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ success });
  } catch (error) {
    logger.error(`Error removing tags from report: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error removing tags from report' });
  }
});

app.get('/api/history/tags', (req, res) => {
  try {
    const tags = reportHistory.getAllTags();
    res.json({ tags });
  } catch (error) {
    logger.error('Error getting tags', error);
    res.status(500).json({ error: 'Error getting tags' });
  }
});

app.get('/api/history/stats', (req, res) => {
  try {
    const stats = reportHistory.getStatistics();
    res.json(stats);
  } catch (error) {
    logger.error('Error getting report statistics', error);
    res.status(500).json({ error: 'Error getting report statistics' });
  }
});

app.post('/api/history/cleanup', (req, res) => {
  try {
    const { maxAgeDays } = req.body;
    
    const deletedCount = reportHistory.cleanupOldReports(
      maxAgeDays ? parseInt(maxAgeDays, 10) : undefined
    );
    
    res.json({ success: true, deletedCount });
  } catch (error) {
    logger.error('Error cleaning up old reports', error);
    res.status(500).json({ error: 'Error cleaning up old reports' });
  }
});

// Report Template API routes
app.get('/api/templates', (req, res) => {
  try {
    const { search, tags } = req.query;
    
    // Parse tags if provided
    const parsedTags = tags ? tags.split(',') : undefined;
    
    const templates = reportTemplate.getTemplates({
      search,
      tags: parsedTags
    });
    
    res.json({ templates });
  } catch (error) {
    logger.error('Error getting templates', error);
    res.status(500).json({ error: 'Error getting templates' });
  }
});

app.get('/api/templates/:id', (req, res) => {
  try {
    const { id } = req.params;
    const template = reportTemplate.getTemplate(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ template });
  } catch (error) {
    logger.error(`Error getting template: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error getting template' });
  }
});

app.post('/api/templates', (req, res) => {
  try {
    const template = req.body;
    const id = reportTemplate.createTemplate(template);
    res.json({ id, success: true });
  } catch (error) {
    logger.error('Error creating template', error);
    res.status(500).json({ error: 'Error creating template' });
  }
});

app.put('/api/templates/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const template = reportTemplate.updateTemplate(id, updates);
    res.json({ template });
  } catch (error) {
    logger.error(`Error updating template: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error updating template' });
  }
});

app.delete('/api/templates/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = reportTemplate.deleteTemplate(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ success });
  } catch (error) {
    logger.error(`Error deleting template: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error deleting template' });
  }
});

app.post('/api/templates/:id/clone', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const newId = reportTemplate.cloneTemplate(id, name);
    res.json({ id: newId, success: true });
  } catch (error) {
    logger.error(`Error cloning template: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error cloning template' });
  }
});

app.get('/api/templates/tags', (req, res) => {
  try {
    const tags = reportTemplate.getAllTags();
    res.json({ tags });
  } catch (error) {
    logger.error('Error getting template tags', error);
    res.status(500).json({ error: 'Error getting template tags' });
  }
});

app.post('/api/templates/:id/sample-data', (req, res) => {
  try {
    const { id } = req.params;
    const { count } = req.body;
    const sampleData = reportTemplate.generateSampleData(id, count || 10);
    res.json({ data: sampleData });
  } catch (error) {
    logger.error(`Error generating sample data for template: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error generating sample data' });
  }
});

app.post('/api/templates/:id/create-report', (req, res) => {
  try {
    const { id } = req.params;
    const params = req.body;
    const reportConfig = reportTemplate.createReportFromTemplate(id, params);
    res.json({ reportConfig });
  } catch (error) {
    logger.error(`Error creating report from template: ${req.params.id}`, error);
    res.status(500).json({ error: 'Error creating report from template' });
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  logger.info('Client connected');
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
  
  // Listen for schedule events
  socket.on('schedule:run', async (id) => {
    try {
      const reportPath = await reportScheduler.runScheduleNow(id);
      socket.emit('schedule:run:complete', { id, reportPath });
    } catch (error) {
      logger.error(`Error running schedule: ${id}`, error);
      socket.emit('schedule:run:error', { id, error: error.message });
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;

function startServer() {
  server.listen(PORT, () => {
    logger.info(`Dashboard server running on http://localhost:${PORT}`);
    console.log(`Dashboard server running on http://localhost:${PORT}`);
  });
}

// Export for use in CLI
module.exports = {
  startServer
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}