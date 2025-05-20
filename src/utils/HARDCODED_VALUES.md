# Hard-Coded Values in Utils Directory

This document identifies hard-coded values in the utils directory that should be replaced with configurable options for better reusability and modularity.

## Hard-Coded URLs

1. **CDN References**:
   - `https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js` in `accessibility/accessibilityUtils.js`
   - `https://cdn.jsdelivr.net/npm/chart.js` in multiple files

   **Recommendation**: Make CDN URLs configurable through environment variables or configuration files.

2. **API Endpoints**:
   - `https://reqres.in/api` in `api/apiHeaderProvider.js`
   - `https://xray.cloud.getxray.app/api/v2` in `xray/xrayUtils.js`

   **Recommendation**: Move all API endpoints to environment variables or configuration files.

## Hard-Coded Credentials

1. **Default Credentials**:
   - `default_username` in `common/dataOrchestrator.js`
   - `default_password` in `common/dataOrchestrator.js`

   **Recommendation**: Remove default credentials and require explicit configuration.

2. **Email Addresses**:
   - `default.user@example.com` in `common/dataOrchestrator.js`
   - `${username}@example.com` in `api/models/User.js`

   **Recommendation**: Make email domain configurable or use a more generic placeholder.

## Hard-Coded Website References

1. **Documentation Links**:
   - `https://playwright.dev/docs/...` in multiple files

   **Note**: These are acceptable as they are documentation references, not functional dependencies.

2. **API References**:
   - `reqres.in` in `api/apiHeaderProvider.js`

   **Recommendation**: Remove specific API references and make them configurable.

## Action Plan

1. **Create Configuration Module**:
   ```javascript
   // src/config/external-resources.js
   module.exports = {
     cdn: {
       axeCore: process.env.AXE_CORE_CDN || 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js',
       chartJs: process.env.CHART_JS_CDN || 'https://cdn.jsdelivr.net/npm/chart.js'
     },
     apis: {
       default: process.env.DEFAULT_API_URL || '',
       xray: process.env.XRAY_API_URL || ''
     },
     email: {
       defaultDomain: process.env.DEFAULT_EMAIL_DOMAIN || 'example.com'
     }
   };
   ```

2. **Update Utility Files**:
   - Replace all hard-coded values with references to the configuration module
   - Remove default credentials and require explicit configuration
   - Add validation to ensure required configuration is provided

3. **Document Required Configuration**:
   - Create a configuration guide that lists all required environment variables
   - Provide examples of how to configure the framework for different environments