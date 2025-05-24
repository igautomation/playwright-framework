/**
 * Salesforce page layouts and views
 */
module.exports = {
  // Standard layouts
  layouts: {
    LIST: 'list',
    NEW: 'new',
    DETAIL: 'view',
    EDIT: 'edit',
    RELATED: 'related'
  },

  // URL patterns
  getUrl(objectName, layout, recordId = '', recordTypeId = '') {
    const base = `/lightning/o/${objectName}`;
    switch (layout) {
      case 'list':
        return `${base}/list`;
      case 'new':
        return `${base}/new${recordTypeId ? `?recordTypeId=${recordTypeId}` : ''}`;
      case 'view':
        return `/lightning/r/${objectName}/${recordId}/view`;
      case 'edit':
        return `/lightning/r/${objectName}/${recordId}/edit`;
      case 'related':
        return `/lightning/r/${objectName}/${recordId}/related`;
      default:
        return base;
    }
  }
};