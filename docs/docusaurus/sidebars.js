/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/introduction',
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/ui-testing',
        'guides/api-testing',
        'guides/e2e-testing',
        'guides/visual-testing',
        'guides/data-driven-testing',
        'guides/ci-cd-integration',
        'guides/test-management',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/cli',
        'api/page-objects',
        'api/web-interactions',
        'api/api-utils',
        'api/test-data-factory',
        'api/reporting',
        'api/xray-integration',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/self-healing-locators',
        'advanced/flaky-test-detection',
        'advanced/network-interception',
        'advanced/custom-fixtures',
        'advanced/performance-optimization',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/login-example',
        'examples/api-example',
        'examples/hybrid-example',
      ],
    },
    {
      type: 'doc',
      id: 'contributing',
      label: 'Contributing',
    },
    {
      type: 'doc',
      id: 'changelog',
      label: 'Changelog',
    },
  ],
};

module.exports = sidebars;