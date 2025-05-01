module.exports = {
  title: 'Playwright Framework',
  tagline: 'Enterprise-grade test automation with Playwright',
  url: 'https://igautomation.github.io',
  baseUrl: '/playwright-framework/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'igautomation',
  projectName: 'playwright-framework',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/igautomation/playwright-framework/edit/main/docs/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ],
  themeConfig: {
    navbar: {
      title: 'Playwright Framework',
      items: [
        { to: '/', label: 'Home', position: 'left' },
        { to: '/docusaurus/docs/intro', label: 'Docs', position: 'left' },
        { to: '/docusaurus/docs/api', label: 'API', position: 'left' },
        {
          href: '/playwright-framework/static/user-guide.pdf',
          label: 'PDF Guide',
          position: 'right'
        }
      ]
    }
  }
};
