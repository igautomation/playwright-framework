#!/usr/bin/env node

/**
 * Script to generate a PDF user guide from the Markdown documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if puppeteer and markdown-pdf are installed
try {
  require.resolve('puppeteer');
  require.resolve('markdown-pdf');
} catch (e) {
  console.log('Installing required dependencies...');
  execSync('npm install --no-save puppeteer markdown-pdf', {
    stdio: 'inherit',
  });
}

const markdownpdf = require('markdown-pdf');
const docsDir = path.resolve(__dirname, '../docs/docusaurus/docs');
const outputDir = path.resolve(__dirname, '../docs/pdf');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all markdown files
const getMarkdownFiles = (dir) => {
  const results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results.push(...getMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });

  return results;
};

// Sort files to ensure correct order
const sortFiles = (files) => {
  // Define the order of sections
  const sectionOrder = [
    'getting-started',
    'guides',
    'api',
    'advanced',
    'examples',
  ];

  return files.sort((a, b) => {
    // Extract section from path
    const sectionA = a.split('/').slice(-2)[0];
    const sectionB = b.split('/').slice(-2)[0];

    // Get section index
    const indexA = sectionOrder.indexOf(sectionA);
    const indexB = sectionOrder.indexOf(sectionB);

    // If sections are different, sort by section order
    if (indexA !== indexB) {
      return indexA - indexB;
    }

    // If sections are the same, sort by filename
    return a.localeCompare(b);
  });
};

// Process markdown files
const processMarkdownFiles = () => {
  console.log('Generating PDF user guide...');

  // Get all markdown files
  const files = getMarkdownFiles(docsDir);
  const sortedFiles = sortFiles(files);

  // Create a combined markdown file
  const combinedMarkdownPath = path.join(outputDir, 'combined.md');
  let combinedMarkdown = '# Playwright Framework User Guide\n\n';

  sortedFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');

    // Remove frontmatter
    const contentWithoutFrontmatter = content.replace(/^---\n.*?\n---\n/s, '');

    // Add section header
    const relativePath = path.relative(docsDir, file);
    const section = relativePath.split('/')[0];
    const fileName = path.basename(file, '.md');

    combinedMarkdown += `\n## ${section.charAt(0).toUpperCase() + section.slice(1)}: ${fileName}\n\n`;
    combinedMarkdown += contentWithoutFrontmatter + '\n\n';
  });

  fs.writeFileSync(combinedMarkdownPath, combinedMarkdown);

  // Convert to PDF
  const pdfPath = path.join(outputDir, 'playwright-framework-user-guide.pdf');

  markdownpdf()
    .from(combinedMarkdownPath)
    .to(pdfPath, () => {
      console.log(`PDF user guide generated at: ${pdfPath}`);
    });
};

// Run the script
processMarkdownFiles();
