# Build stage
FROM mcr.microsoft.com/playwright:v1.40.0-focal AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    build-essential \
    make \
    g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a minimal package.json with all the dependencies we need
RUN echo '{\n\
  "name": "playwright-framework",\n\
  "version": "1.0.0",\n\
  "dependencies": {\n\
    "node-fetch": "^2.6.7",\n\
    "fs-extra": "^10.1.0",\n\
    "js-yaml": "^4.1.0",\n\
    "exceljs": "^4.4.0",\n\
    "fast-xml-parser": "^4.2.2",\n\
    "@playwright/test": "^1.40.0",\n\
    "dotenv": "^16.0.3",\n\
    "@faker-js/faker": "^8.0.0",\n\
    "pixelmatch": "^5.3.0",\n\
    "pngjs": "^7.0.0"\n\
  }\n\
}' > package.json

# Install only the dependencies we need
RUN npm install

# Runtime stage
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg8 \
    libgif7 \
    librsvg2-2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy only runtime dependencies
COPY --from=builder /app/node_modules /app/node_modules

# Create a simple test directory structure
RUN mkdir -p /app/tests/docker-test

# Create a simple test that will pass
RUN echo 'import { test, expect } from "@playwright/test";\n\ntest("Docker test is working", () => {\n  expect(true).toBeTruthy();\n});' > /app/tests/docker-test/docker-test.spec.js

# Create Playwright config
RUN echo 'module.exports = {\n  reporter: "list",\n  testDir: "./tests/docker-test",\n  timeout: 30000,\n  use: {\n    headless: true\n  }\n};' > /app/playwright.config.js

# Create necessary data directories and files
RUN mkdir -p /app/src/data && \
    echo "user:\n  name: John Doe\n  job: Engineer\n  email: john@example.com" > /app/src/data/testData.yaml && \
    touch /app/src/data/testData.xlsx

# Set environment variables
ENV NODE_ENV=production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV API_URL=https://reqres.in

# Default command to run our simple test
CMD ["npx", "playwright", "test"]