# Schedule Examples

This directory contains example schedule configurations for the Playwright Framework's scheduled reports feature.

## Files

- `weekly-report.json`: Example of a weekly report schedule
- `daily-report.json`: Example of a daily report schedule
- `email-config-example.json`: Example email configuration for report notifications

## Usage

### Creating a Schedule

```bash
schedule create --config examples/schedules/weekly-report.json
```

### Setting Email Configuration

```bash
schedule set-email --config examples/schedules/email-config-example.json
```

### Starting Dashboard with Email Configuration

```bash
dashboard --email "$(cat examples/schedules/email-config-example.json)"
```

## Schedule Configuration Format

A schedule configuration file is a JSON file with the following structure:

```json
{
  "name": "Schedule Name",
  "description": "Schedule Description",
  "cronExpression": "0 8 * * 1",
  "timezone": "America/New_York",
  "active": true,
  "recipients": ["user@example.com"],
  "reportConfig": {
    "title": "Report Title",
    "dataSource": {
      "type": "file",
      "fileType": "json",
      "fileName": "data-file.json"
    },
    "charts": [
      {
        "type": "bar",
        "title": "Bar Chart Title",
        "xAxis": "XColumn",
        "yAxis": ["YColumn"],
        "dimensions": {
          "width": 800,
          "height": 400
        }
      },
      {
        "type": "pie",
        "title": "Pie Chart Title",
        "labels": "LabelColumn",
        "values": "ValueColumn",
        "dimensions": {
          "width": 600,
          "height": 600
        }
      },
      {
        "type": "table",
        "title": "Table Title",
        "columns": ["Column1", "Column2", "Column3"],
        "filter": "item.Column1 > 100",
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

## Email Configuration Format

An email configuration file is a JSON file with the following structure:

```json
{
  "host": "smtp.example.com",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "user@example.com",
    "pass": "password"
  },
  "from": "Reports <reports@example.com>"
}
```

## Cron Expression Examples

- `0 8 * * 1`: Every Monday at 8:00 AM
- `0 6 * * *`: Every day at 6:00 AM
- `0 0 1 * *`: At midnight on the first day of every month
- `0 12 * * 1-5`: Every weekday at noon
- `*/15 * * * *`: Every 15 minutes