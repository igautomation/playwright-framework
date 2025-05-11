# Playwright Framework Documentation

This directory contains the documentation for the Playwright Framework.

## Documentation Structure

The documentation is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Directory Structure

```
docs/
├── docusaurus/           # Docusaurus project
│   ├── docs/             # Documentation content
│   │   ├── api/          # API reference
│   │   ├── getting-started/ # Getting started guides
│   │   ├── guides/       # User guides
│   │   └── advanced/     # Advanced topics
│   ├── src/              # Source files for the website
│   ├── static/           # Static files
│   ├── docusaurus.config.js # Docusaurus configuration
│   └── sidebars.js       # Sidebar configuration
├── assets/               # Assets for the documentation
└── README.md             # This file
```

## Building the Documentation

To build the documentation:

```bash
# Navigate to the project root
cd /path/to/playwright-framework

# Run the build script
./build-docs.sh
```

This will:
1. Navigate to the Docusaurus directory
2. Install dependencies if needed
3. Build the site
4. Copy any missing assets

## Viewing the Documentation

After building, you can view the documentation:

```bash
# Navigate to the Docusaurus directory
cd docs/docusaurus

# Start the local server
npm run serve
```

Then open your browser to [http://localhost:3000](http://localhost:3000).

## Editing the Documentation

### Adding a New Page

1. Create a new Markdown file in the appropriate directory under `docs/docusaurus/docs/`
2. Add frontmatter at the top of the file:

```markdown
---
sidebar_position: 1
---

# Page Title

Content goes here...
```

3. Update `sidebars.js` if needed to include the new page

### Adding Images

1. Place image files in the `docs/assets/` directory
2. Reference them in your Markdown files:

```markdown
![Alt Text](../assets/image-name.png)
```

## Deploying the Documentation

The documentation can be deployed to GitHub Pages:

```bash
# Navigate to the Docusaurus directory
cd docs/docusaurus

# Deploy to GitHub Pages
npm run deploy
```

This will build the site and push it to the `gh-pages` branch of your repository.

## Additional Resources

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Pages](https://pages.github.com/)