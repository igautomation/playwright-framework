#!/bin/bash

# Script to verify Docker functionality
# This script checks if Docker is installed, builds the image, and runs a simple test

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🐳 Verifying Docker functionality...${NC}"

# Step 1: Check if Docker is installed
echo -e "\n${YELLOW}Step 1: Checking if Docker is installed...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed.${NC}"
    docker --version
else
    echo -e "${RED}❌ Docker is not installed or not in PATH.${NC}"
    echo -e "${YELLOW}Please install Docker and try again.${NC}"
    echo -e "${YELLOW}Visit https://docs.docker.com/get-docker/ for installation instructions.${NC}"
    exit 1
fi

# Step 2: Check if Docker daemon is running
echo -e "\n${YELLOW}Step 2: Checking if Docker daemon is running...${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker daemon is running.${NC}"
else
    echo -e "${RED}❌ Docker daemon is not running.${NC}"
    echo -e "${YELLOW}Please start Docker and try again.${NC}"
    exit 1
fi

# Step 3: Build the Docker image
echo -e "\n${YELLOW}Step 3: Building Docker image...${NC}"
if docker build -t playwright-framework-verify . ; then
    echo -e "${GREEN}✅ Docker image built successfully.${NC}"
else
    echo -e "${RED}❌ Failed to build Docker image.${NC}"
    exit 1
fi

# Step 4: Create a temporary test file
echo -e "\n${YELLOW}Step 4: Creating temporary test file...${NC}"
mkdir -p /tmp/docker-verify-test
cat > /tmp/docker-verify-test/docker-verify.spec.js << 'EOL'
import { test, expect } from '@playwright/test';

test('Docker verification test', async () => {
  console.log('Running test in Docker container');
  expect(process.env.DOCKER_VERIFICATION).toBe('true');
});
EOL

# Step 5: Run the test in Docker
echo -e "\n${YELLOW}Step 5: Running test in Docker container...${NC}"
if docker run --rm \
  -v "/tmp/docker-verify-test:/app/tests/docker-verify" \
  -e DOCKER_VERIFICATION=true \
  playwright-framework-verify \
  npx playwright test /app/tests/docker-verify/docker-verify.spec.js; then
    echo -e "${GREEN}✅ Docker test executed successfully.${NC}"
    TEST_RESULT=0
else
    echo -e "${RED}❌ Docker test failed.${NC}"
    TEST_RESULT=1
fi

# Step 6: Clean up
echo -e "\n${YELLOW}Step 6: Cleaning up...${NC}"
rm -rf /tmp/docker-verify-test

# Final result
echo -e "\n${YELLOW}Docker Verification Results:${NC}"
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Docker is working properly!${NC}"
    exit 0
else
    echo -e "${RED}❌ Docker verification failed.${NC}"
    exit 1
fi