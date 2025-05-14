#!/bin/bash

# Script to run Docker verification tests

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🐳 Running Docker verification tests...${NC}"

# First, verify Docker is installed and working
echo -e "\n${YELLOW}Step 1: Verifying Docker installation...${NC}"
bash ./scripts/verify-docker.sh

# Check if the verification was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Docker verification failed. Please fix the issues and try again.${NC}"
  exit 1
fi

# Run the Docker verification tests
echo -e "\n${YELLOW}Step 2: Running Docker verification tests...${NC}"

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t playwright-framework-tests .

# Run the tests
echo -e "${YELLOW}Running tests in Docker...${NC}"
docker run --rm \
  -v "$(pwd)/test-results:/app/test-results" \
  -v "$(pwd)/playwright-report:/app/playwright-report" \
  -e DOCKER_VERIFICATION=true \
  playwright-framework-tests \
  npx playwright test tests/docker/docker-verification.spec.js

# Check if the tests were successful
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}✅ Docker verification tests passed!${NC}"
  echo -e "${GREEN}Docker is working properly in this environment.${NC}"
  exit 0
else
  echo -e "\n${RED}❌ Docker verification tests failed.${NC}"
  echo -e "${RED}Please check the test output for more details.${NC}"
  exit 1
fi