---
sidebar_position: 11
---

# Documentation Deployment Guide

This guide provides step-by-step instructions for deploying the Playwright Framework documentation to various hosting platforms.

## Deployment Options

The Playwright Framework documentation can be deployed to several hosting platforms:

1. **GitHub Pages** (recommended): Free hosting directly from your GitHub repository
2. **Netlify**: Fast, global CDN with continuous deployment
3. **Vercel**: Edge network with preview deployments
4. **AWS Amplify**: Integrated with AWS services
5. **Firebase Hosting**: Google's hosting service

## Prerequisites

Before deploying, ensure you have:

1. A GitHub account
2. Git installed on your machine
3. Node.js and npm installed
4. Access to the Playwright Framework repository

## Deploying to GitHub Pages

### Using the Deployment Script

The easiest way to deploy is using the provided script:

```bash
./deploy-docs.sh
```

This script:
1. Builds the documentation
2. Deploys it to the `gh-pages` branch
3. Makes it available at `https://your-org.github.io/playwright-framework/`

### Manual Deployment

If you prefer to deploy manually:

1. Navigate to the Docusaurus directory:
   ```bash
   cd docs/docusaurus
   ```

2. Install dependencies if needed:
   ```bash
   npm install
   ```

3. Build the documentation:
   ```bash
   npm run build
   ```

4. Deploy to GitHub Pages:
   ```bash
   GIT_USER=<Your GitHub Username> \
     CURRENT_BRANCH=main \
     USE_SSH=true \
     npm run deploy
   ```

### Setting Up GitHub Actions for Automatic Deployment

To automatically deploy when changes are pushed:

1. Create a file `.github/workflows/deploy-docs.yml`:

```yaml
name: Deploy Documentation

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: npm
      - name: Install dependencies
        run: |
          cd docs/docusaurus
          npm ci
      - name: Build and deploy
        run: |
          cd docs/docusaurus
          npm run build
          
          # Configure Git
          git config --global user.email "actions@github.com"
          git config --global user.name "GitHub Actions"
          
          # Deploy
          GIT_USER=github-actions \
            CURRENT_BRANCH=main \
            USE_SSH=false \
            npm run deploy
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

2. Commit and push this file to your repository.

## Deploying to Netlify

Netlify offers continuous deployment and a global CDN:

1. Create a `netlify.toml` file in the repository root:

```toml
[build]
  base = "docs/docusaurus"
  publish = "build"
  command = "npm run build"
```

2. Sign up for Netlify and connect your GitHub repository.

3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Base directory: `docs/docusaurus`

4. Click "Deploy site".

## Deploying to Vercel

Vercel provides edge hosting with preview deployments:

1. Create a `vercel.json` file in the repository root:

```json
{
  "buildCommand": "cd docs/docusaurus && npm install && npm run build",
  "outputDirectory": "docs/docusaurus/build",
  "rewrites": [
    { "source": "/(.*)", "destination": "/docs/docusaurus/build/$1" }
  ]
}
```

2. Sign up for Vercel and connect your GitHub repository.

3. Import your project and deploy.

## Deploying to AWS Amplify

AWS Amplify integrates with other AWS services:

1. Sign in to the AWS Management Console.

2. Navigate to AWS Amplify and click "New app" > "Host web app".

3. Connect your GitHub repository.

4. Configure the build settings:
   - Build command: `cd docs/docusaurus && npm install && npm run build`
   - Output directory: `docs/docusaurus/build`

5. Click "Save and deploy".

## Deploying to Firebase Hosting

Firebase Hosting is good if you're already using Firebase:

1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Specify `docs/docusaurus/build` as the public directory
   - Configure as a single-page app: `No`

4. Build the documentation:
   ```bash
   cd docs/docusaurus
   npm run build
   ```

5. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

## Custom Domain Configuration

### Setting Up a Custom Domain

To use a custom domain (e.g., `docs.your-domain.com`):

1. Add a `CNAME` file to `docs/docusaurus/static/CNAME` with your domain:
   ```
   docs.your-domain.com
   ```

2. Configure your DNS settings:
   - For GitHub Pages: Create a CNAME record pointing to `your-org.github.io`
   - For other platforms: Follow their specific instructions

3. Update `docusaurus.config.js`:
   ```javascript
   module.exports = {
     // ...
     url: 'https://docs.your-domain.com',
     baseUrl: '/',
     // ...
   };
   ```

### SSL Configuration

Most platforms provide SSL certificates automatically:

- **GitHub Pages**: Automatic HTTPS with Let's Encrypt
- **Netlify**: Automatic HTTPS with Let's Encrypt
- **Vercel**: Automatic HTTPS with Let's Encrypt
- **AWS Amplify**: Automatic HTTPS with Amazon Certificate Manager
- **Firebase Hosting**: Automatic HTTPS with Firebase

## Deployment Best Practices

### 1. Test Locally Before Deploying

Always build and test locally first:

```bash
cd docs/docusaurus
npm run build
npm run serve
```

### 2. Use Continuous Deployment

Set up automatic deployment to ensure documentation stays current.

### 3. Version Your Documentation

For multiple framework versions, use Docusaurus versioning:

```bash
cd docs/docusaurus
npm run docusaurus docs:version 1.0.0
```

### 4. Optimize for Search Engines

Update `docusaurus.config.js` with proper metadata:

```javascript
module.exports = {
  // ...
  title: 'Playwright Framework',
  tagline: 'Enterprise-grade test automation framework',
  description: 'Documentation for the Playwright Framework',
  // ...
};
```

### 5. Monitor Performance

Use Lighthouse or PageSpeed Insights to check performance.

## Troubleshooting Common Deployment Issues

### Build Failures

If the build fails:

1. Check for JavaScript errors in the console
2. Verify all dependencies are installed
3. Check for broken links or references

### 404 Errors After Deployment

If pages return 404 errors:

1. Check the `baseUrl` in `docusaurus.config.js`
2. Verify the build directory structure
3. Check if the deployment completed successfully

### Custom Domain Not Working

If your custom domain isn't working:

1. Verify DNS settings (may take up to 48 hours to propagate)
2. Check the CNAME file is in the correct location
3. Verify SSL certificate issuance

### Broken Links

To check for broken links:

```bash
cd docs/docusaurus
npm run docusaurus build --out-dir build
npm run docusaurus serve
```

Then use a link checker tool like `broken-link-checker`:

```bash
npx broken-link-checker http://localhost:3000
```

## Deployment Checklist

Before deploying, check:

- [ ] All documentation changes are committed
- [ ] Documentation builds successfully locally
- [ ] No broken links or images
- [ ] Sidebar navigation is correct
- [ ] Search functionality works
- [ ] Mobile responsiveness is good

After deploying, verify:

- [ ] Site is accessible at the expected URL
- [ ] All pages load correctly
- [ ] Search functionality works
- [ ] No console errors
- [ ] SSL certificate is valid

## Keeping Documentation Updated

To keep the documentation current:

1. Set up a regular review schedule
2. Update documentation alongside code changes
3. Use GitHub Actions to automatically deploy updates
4. Collect and incorporate user feedback

## Additional Resources

- [Docusaurus Deployment Guide](https://docusaurus.io/docs/deployment)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)