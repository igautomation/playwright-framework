name: Deploy Playwright Reports to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Deploy Playwright Reports to GitHub Pages
        run: |
          chmod +x .github/pages/deploy-reports.sh
          .github/pages/deploy-reports.sh
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}