/**
 * External resources configuration
 * 
 * This file contains URLs and references to external resources used by the framework
 */

module.exports = {
  cdn: {
    axeCore: process.env.AXE_CORE_CDN || 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js',
    chartJs: process.env.CHART_JS_CDN || 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
  },
  apis: {
    xray: process.env.XRAY_API_URL || 'https://xray.cloud.getxray.app/api/v2'
  }
};