FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Install Salesforce CLI
RUN npm install -g @salesforce/cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p src/pages tests/pages sessions

# Set environment variables
ENV NODE_ENV=production
ENV CI=true
ENV HEADLESS=true

# Default command
CMD ["npm", "test"]