# Environment Variables

This document lists all environment variables used in the test framework.

## Setup

1. Copy `.env.example` to `.env`
2. Update the values as needed

## Available Variables

### Base URLs
- `BASE_URL`: Base URL for the application (default: https://demo.playwright.dev)
- `API_URL`: Base URL for the API (default: https://reqres.in/api)
- `API_BASE_URL`: Base URL for the API without path (default: https://reqres.in)
- `ORANGEHRM_URL`: URL for OrangeHRM demo site (default: https://opensource-demo.orangehrmlive.com/web/index.php/auth/login)
- `TODO_APP_URL`: URL for Todo app (default: https://demo.playwright.dev/todomvc/#/)
- `PLAYWRIGHT_DOCS_URL`: URL for Playwright documentation (default: https://playwright.dev/)
- `AUTOMATION_EXERCISE_URL`: URL for Automation Exercise site (default: https://automationexercise.com)
- `SELECTORS_HUB_URL`: URL for SelectorsHub practice page (default: https://selectorshub.com/xpath-practice-page/)
- `EXAMPLE_URL`: Example URL for tests (default: https://example.com)
- `EXAMPLE_API_URL`: Example API URL for tests (default: https://api.example.com)
- `W3C_URL`: W3C website URL (default: https://www.w3.org)
- `W3C_WAI_URL`: W3C WAI website URL (default: https://www.w3.org/WAI)
- `GITHUB_URL`: GitHub URL (default: https://github.com)
- `NON_EXISTENT_URL`: URL that doesn't exist (used for error testing)

### Authentication
- `USERNAME`: Username for authentication (default: Admin)
- `PASSWORD`: Password for authentication (default: admin123)
- `API_TOKEN`: Token name for API authentication (default: token)

### External Resources
- `AXE_CORE_CDN`: URL for Axe Core CDN (default: https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js)
- `CHART_JS_CDN`: URL for Chart.js CDN (default: https://cdn.jsdelivr.net/npm/chart.js)
- `DEFAULT_EMAIL_DOMAIN`: Default email domain for test data (default: example.com)

## Usage in Tests

Environment variables can be accessed in test files using `process.env`:

```javascript
// Navigate to the page
await page.goto(process.env.PLAYWRIGHT_DOCS_URL);

// Login with credentials
await loginPage.login(process.env.USERNAME, process.env.PASSWORD);

// Use API URL with path
await request.get(`${process.env.API_URL}/users/2`);
```