---
sidebar_position: 11
---

# Deploying the Documentation

This guide explains how to deploy the Playwright Framework documentation to various hosting platforms.

## Deploying to GitHub Pages

GitHub Pages is the recommended hosting platform for the documentation. It's free, easy to set up, and integrates well with GitHub repositories.

### Automatic Deployment

The easiest way to deploy the documentation is using the provided deployment script:

```bash
./deploy-docs.sh
```

This script will:
1. Navigate to the Docusaurus directory
2. Install dependencies if needed
3. Build the documentation site
4. Deploy the site to GitHub Pages

### Manual Deployment

If you prefer to deploy manually, follow these steps:

1. Navigate to the Docusaurus directory:
   ```bash
   cd docs/docusaurus
   ```

2. Build the documentation:
   ```bash
   npm run build
   ```

3. Deploy to GitHub Pages:
   ```bash
   GIT_USER=<Your GitHub Username> \
     CURRENT_BRANCH=main \
     USE_SSH=true \
     npm run deploy
   ```

   Or if you prefer HTTPS:
   ```bash
   GIT_USER=<Your GitHub Username> \
     CURRENT_BRANCH=main \
     USE_SSH=false \
     npm run deploy
   ```

### GitHub Actions Deployment

You can also set up automatic deployment using GitHub Actions:

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

3. GitHub Actions will automatically deploy your documentation whenever changes are pushed to the `docs` directory on the `main` branch.

## Deploying to Netlify

Netlify is another popular option for hosting documentation sites.

### Deploying to Netlify

1. Create a `netlify.toml` file in the root of your repository:
   ```toml
   [build]
     base = "docs/docusaurus"
     publish = "build"
     command = "npm run build"
   ```

2. Push this file to your repository.

3. Log in to Netlify and click "New site from Git".

4. Select your repository and configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Base directory: `docs/docusaurus`

5. Click "Deploy site".

### Continuous Deployment with Netlify

Netlify automatically sets up continuous deployment. Whenever you push changes to your repository, Netlify will rebuild and redeploy your documentation.

## Deploying to Vercel

Vercel is another excellent option for hosting documentation sites.

### Deploying to Vercel

1. Create a `vercel.json` file in the root of your repository:
   ```json
   {
     "buildCommand": "cd docs/docusaurus && npm install && npm run build",
     "outputDirectory": "docs/docusaurus/build",
     "rewrites": [
       { "source": "/(.*)", "destination": "/docs/docusaurus/build/$1" }
     ]
   }
   ```

2. Push this file to your repository.

3. Log in to Vercel and click "New Project".

4. Select your repository and click "Deploy".

### Continuous Deployment with Vercel

Like Netlify, Vercel automatically sets up continuous deployment. Your documentation will be rebuilt and redeployed whenever you push changes to your repository.

## Deploying to AWS Amplify

AWS Amplify is a good option if you're already using AWS services.

### Deploying to AWS Amplify

1. Log in to the AWS Management Console and navigate to AWS Amplify.

2. Click "New app" and select "Host web app".

3. Select GitHub as the repository provider and connect your repository.

4. Configure the build settings:
   - Build command: `cd docs/docusaurus && npm install && npm run build`
   - Output directory: `docs/docusaurus/build`

5. Click "Save and deploy".

### Continuous Deployment with AWS Amplify

AWS Amplify automatically sets up continuous deployment. Your documentation will be rebuilt and redeployed whenever you push changes to your repository.

## Deploying to Firebase Hosting

Firebase Hosting is a good option if you're already using Firebase services.

### Deploying to Firebase Hosting

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
   - Set up automatic builds and deploys with GitHub: `No`

4. Build the documentation:
   ```bash
   cd docs/docusaurus
   npm run build
   ```

5. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

### Continuous Deployment with Firebase Hosting

You can set up continuous deployment with GitHub Actions:

1. Create a file `.github/workflows/firebase-deploy.yml`:
   ```yaml
   name: Deploy to Firebase Hosting

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
         - name: Build
           run: |
             cd docs/docusaurus
             npm run build
         - name: Deploy to Firebase
           uses: FirebaseExtended/action-hosting-deploy@v0
           with:
             repoToken: '${{ secrets.GITHUB_TOKEN }}'
             firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
             channelId: live
             projectId: your-firebase-project-id
   ```

2. Set up the `FIREBASE_SERVICE_ACCOUNT` secret in your GitHub repository settings.

3. Commit and push this file to your repository.

## Custom Domain Configuration

### GitHub Pages

1. Create a `CNAME` file in the `docs/docusaurus/static` directory with your domain:
   ```
   docs.your-domain.com
   ```

2. Configure your DNS settings to point to GitHub Pages:
   - Create a CNAME record for `docs.your-domain.com` pointing to `your-username.github.io`

3. In your GitHub repository settings, under "Pages", add your custom domain.

### Netlify

1. In the Netlify dashboard, go to "Site settings" > "Domain management".

2. Click "Add custom domain" and enter your domain.

3. Follow the instructions to configure your DNS settings.

### Vercel

1. In the Vercel dashboard, go to "Settings" > "Domains".

2. Add your domain and follow the instructions to configure your DNS settings.

### AWS Amplify

1. In the AWS Amplify console, go to "App settings" > "Domain management".

2. Click "Add domain" and follow the instructions.

### Firebase Hosting

1. In the Firebase console, go to "Hosting" > "Custom domains".

2. Click "Add custom domain" and follow the instructions.

## Troubleshooting Deployment Issues

### GitHub Pages Deployment Fails

1. Check that the `GIT_USER` environment variable is set correctly.
2. Ensure you have the necessary permissions to push to the repository.
3. Check if the `gh-pages` branch exists and is protected.

### Build Failures

1. Check the build logs for errors.
2. Ensure all dependencies are installed.
3. Verify that the build command is correct.

### Custom Domain Issues

1. Check your DNS configuration.
2. Ensure the CNAME file is in the correct location.
3. Wait for DNS propagation (can take up to 48 hours).

### 404 Errors After Deployment

1. Check that the base URL is configured correctly in `docusaurus.config.js`.
2. Ensure the build directory is correct.
3. Verify that the deployment process completed successfully.

## Deployment Best Practices

1. **Test locally before deploying**: Always build and test the documentation locally before deploying.
2. **Use continuous deployment**: Set up automatic deployment to ensure the documentation is always up-to-date.
3. **Version your documentation**: Consider setting up versioning for your documentation if you have multiple versions of your framework.
4. **Monitor deployment status**: Check the deployment status and logs to ensure successful deployment.
5. **Back up your documentation**: Regularly back up your documentation source files.
6. **Use a staging environment**: Consider setting up a staging environment to test changes before deploying to production.