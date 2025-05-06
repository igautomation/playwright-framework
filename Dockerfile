<<<<<<< HEAD
# Use Node LTS version
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy all project files to container
COPY . .

# Install Node dependencies
RUN npm install

# Install Playwright browsers (Chromium, Firefox, Webkit)
RUN npx playwright install --with-deps

# Default command: run all Playwright tests
CMD ["npx", "playwright", "test"]
=======
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the framework
COPY . .

# Set environment variables
ENV NODE_ENV=dev
ENV HEADLESS=true

# Default command
CMD ["npm", "test"]
>>>>>>> 51948a2 (Main v1.0)
