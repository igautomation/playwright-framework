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
