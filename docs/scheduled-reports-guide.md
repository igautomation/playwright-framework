# Scheduled Reports Guide

This guide explains how to use the scheduled reports feature in the Playwright framework.

## Overview

The scheduled reports feature allows you to automatically generate reports on a regular schedule. This is useful for:

- Monitoring data trends over time
- Generating weekly or monthly reports
- Automating reporting workflows
- Sending reports to stakeholders via email

## Getting Started

### Accessing Scheduled Reports

You can access the scheduled reports feature through the dashboard:

1. Start the dashboard: `dashboard`
2. Navigate to the "Scheduled Reports" section in the sidebar
3. Click "Create Schedule" to set up a new scheduled report

### Creating a Schedule

To create a new scheduled report:

1. Click "Create Schedule" in the Scheduled Reports page
2. Fill in the schedule details:
   - **Name**: A descriptive name for the schedule
   - **Description**: Optional description
   - **Frequency**: Daily, Weekly, Monthly, or Custom
   - **Time**: When the report should be generated
   - **Timezone**: The timezone for the schedule
3. Configure the report:
   - **Report Title**: Title for the generated report
   - **Data Source**: Select a data file (JSON or CSV)
   - **Charts**: Select which chart types to include
   - **Columns**: Select which columns to analyze
4. Set up email notifications (optional):
   - **Recipients**: Email addresses to receive the report
5. Click "Save Schedule"

### Schedule Frequencies

You can set up reports to run at different frequencies:

- **Daily**: Every day at a specified time
- **Weekly**: On specific days of the week at a specified time
- **Monthly**: On a specific day of the month at a specified time
- **Custom**: Using a custom cron expression

### Cron Expressions

For advanced scheduling, you can use cron expressions. A cron expression consists of five fields:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Examples:
- `0 8 * * 1-5`: Every weekday at 8:00 AM
- `0 0 1 * *`: At midnight on the first day of every month
- `0 12 * * *`: Every day at noon
- `*/15 * * * *`: Every 15 minutes

## Managing Schedules

### Viewing Schedules

The Scheduled Reports page shows all your scheduled reports with:
- Name
- Frequency
- Next run time
- Status (Active/Inactive)
- Actions

### Editing Schedules

To edit a schedule:
1. Click the edit button (pencil icon) next to the schedule
2. Modify the schedule settings
3. Click "Update"

### Running Schedules Manually

To run a schedule immediately:
1. Click the run button (play icon) next to the schedule
2. The report will be generated and opened in a new tab

### Deleting Schedules

To delete a schedule:
1. Click the edit button (pencil icon) next to the schedule
2. Click "Delete" in the edit modal
3. Confirm the deletion

## Email Notifications

You can configure the system to send email notifications when reports are generated.

### Setting Up Email

To enable email notifications, you need to provide SMTP configuration when starting the dashboard:

```bash
dashboard --email '{"host":"smtp.example.com","port":587,"secure":false,"auth":{"user":"user@example.com","pass":"password"}}'
```

### Adding Recipients

When creating or editing a schedule, you can specify recipients who will receive the report by email. Enter comma-separated email addresses in the Recipients field.

## Command Line Interface

You can also manage scheduled reports through the command line:

### List Schedules

```bash
node src/cli/schedule.js list
```

### Create Schedule

```bash
node src/cli/schedule.js create --config schedule-config.json
```

### Run Schedule

```bash
node src/cli/schedule.js run --id schedule-123
```

### Delete Schedule

```bash
node src/cli/schedule.js delete --id schedule-123
```

## Schedule Configuration Format

When creating schedules programmatically, use the following JSON format:

```json
{
  "name": "Weekly Sales Report",
  "description": "Weekly report of sales data",
  "cronExpression": "0 8 * * 1",
  "timezone": "America/New_York",
  "active": true,
  "recipients": ["user@example.com", "manager@example.com"],
  "reportConfig": {
    "title": "Weekly Sales Report",
    "dataSource": {
      "type": "file",
      "fileType": "json",
      "fileName": "sales-data.json"
    },
    "charts": [
      {
        "type": "bar",
        "title": "Sales by Product",
        "xAxis": "product",
        "yAxis": ["sales"],
        "dimensions": {
          "width": 800,
          "height": 400
        }
      },
      {
        "type": "pie",
        "title": "Sales Distribution",
        "labels": "category",
        "values": "sales",
        "dimensions": {
          "width": 600,
          "height": 600
        }
      },
      {
        "type": "table",
        "title": "Top Products",
        "columns": ["product", "sales", "revenue"],
        "filter": "item.sales > 100",
        "limit": 10,
        "dimensions": {
          "width": 800,
          "height": 400
        }
      }
    ]
  }
}
```

## Integration with Web Scraping

You can combine scheduled reports with web scraping to automatically generate reports from scraped data:

1. Set up a scheduled scraping task using a cron job:
   ```bash
   0 6 * * * cd /path/to/playwright-framework && node src/cli/scrape.js table https://example.com/data "#data-table" -o daily-data.json
   ```

2. Create a scheduled report that uses the scraped data:
   ```bash
   30 6 * * * cd /path/to/playwright-framework && node src/cli/schedule.js run --id daily-report
   ```

This will scrape data at 6:00 AM and generate a report at 6:30 AM every day.

## Best Practices

1. **Test schedules** by running them manually before activating
2. **Use descriptive names** for schedules to easily identify them
3. **Set appropriate frequencies** based on how often the data changes
4. **Monitor disk space** as reports can accumulate over time
5. **Review and clean up** old reports periodically
6. **Use email notifications** for important reports
7. **Set up error notifications** for failed schedules