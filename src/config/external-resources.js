/**
 * External Resources Configuration
 * 
 * Centralizes all external resource references to make them configurable
 */

module.exports = {
  /**
   * CDN resources
   */
  cdn: {
    /**
     * Axe Core library for accessibility testing
     */
    axeCore: process.env.AXE_CORE_CDN || 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js',
    
    /**
     * Chart.js library for visualization
     */
    chartJs: process.env.CHART_JS_CDN || 'https://cdn.jsdelivr.net/npm/chart.js'
  },
  
  /**
   * API endpoints
   */
  apis: {
    /**
     * Default API endpoint
     * @required
     */
    default: process.env.DEFAULT_API_URL || '',
    
    /**
     * Xray API endpoint
     */
    xray: process.env.XRAY_API_URL || '',
    
    /**
     * OAuth token endpoint
     */
    oauthToken: process.env.OAUTH_TOKEN_URL || ''
  },
  
  /**
   * Email configuration
   */
  email: {
    /**
     * Default email domain for generated emails
     */
    defaultDomain: process.env.DEFAULT_EMAIL_DOMAIN || 'example.com'
  },
  
  /**
   * Validate that required configuration is provided
   * @throws {Error} If required configuration is missing
   */
  validate() {
    const requiredVars = [
      { name: 'DEFAULT_API_URL', value: this.apis.default }
    ];
    
    const missing = requiredVars.filter(v => !v.value);
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required configuration: ${missing.map(v => v.name).join(', ')}. ` +
        'Please set these environment variables or update the configuration.'
      );
    }
  }
};