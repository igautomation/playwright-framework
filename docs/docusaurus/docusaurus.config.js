module.exports = {
    title: 'Playwright Framework',
    tagline: 'Enterprise-grade test automation with Playwright',
    url: 'https://<username>.github.io',
    baseUrl: '/playwright-framework/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: '<username>',
    projectName: 'playwright-framework',
    presets: [
      [
        '@docusaurus/preset-classic',
        {
          docs: {
            sidebarPath: require.resolve('./sidebars.js'),
            editUrl: 'https://github.com/<username>/playwright-framework/edit/main/docs/',
          },
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
          },
        },
      ],
    ],
    themeConfig: {
      navbar: {
        title: 'Playwright Framework',
        items: [
          { to: '/docs/intro', label: 'Docs', position: 'left' },
          { to: '/docs/api', label: 'API', position: 'left' },
          { href: '/user-guide.pdf', label: 'PDF Guide', position: 'right' },
        ],
      },
    },
  };