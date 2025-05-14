# Docker Support in Playwright Framework

This document provides detailed information about using Docker with the Playwright Framework.

## Prerequisites

- Docker installed on your machine
- Docker daemon running
- Basic knowledge of Docker commands

## Verifying Docker Setup

To verify that Docker is properly set up and working with the framework, run:

```bash
# Make the Docker verification script executable
chmod +x run-docker-verify.sh

# Run the Docker verification
./run-docker-verify.sh
```

Alternatively, you can use npm scripts:

```bash
# Make the script executable
npm run make:docker-verify-executable

# Run the verification
npm run test:docker
```

## Docker Verification Process

The Docker verification process performs the following checks:

1. Verifies Docker is installed
2. Confirms Docker daemon is running
3. Builds the Docker image
4. Runs a simple test in Docker
5. Reports the results

If all steps complete successfully, Docker is properly configured to work with the framework.

## Running Tests in Docker

You can run tests in Docker using the provided scripts:

```bash
# Run all tests in Docker
bash scripts/docker-run.sh

# Run tests with specific tags
bash scripts/docker-run.sh --tags @smoke

# Run tests in headed mode
bash scripts/docker-run.sh --headed

# Run tests for a specific project
bash scripts/docker-run.sh --project chromium
```

## Docker Compose

The framework includes a Docker Compose configuration for more complex setups:

```bash
# Start services defined in docker-compose.yml
docker-compose up

# Run tests using Docker Compose
docker-compose run playwright npx playwright test

# Run specific tests
docker-compose run playwright npx playwright test tests/api
```

## Docker Images

The framework uses the official Playwright Docker images:

- Base image: `mcr.microsoft.com/playwright:v1.40.0-focal`
- This image includes all necessary browsers and dependencies

## Custom Docker Configuration

### Environment Variables

You can pass environment variables to the Docker container:

```bash
docker run --rm \
  -v "$(pwd)/reports:/app/reports" \
  -e BASE_URL=https://example.com \
  -e API_URL=https://api.example.com \
  -e USERNAME=testuser \
  -e PASSWORD=testpass \
  playwright-framework
```

### Volume Mounts

The following volumes are typically mounted:

- `reports`: For test reports
- `test-results`: For test results
- `allure-results`: For Allure reports
- `visual-diffs`: For visual test differences

Example:

```bash
docker run --rm \
  -v "$(pwd)/reports:/app/reports" \
  -v "$(pwd)/test-results:/app/test-results" \
  -v "$(pwd)/allure-results:/app/allure-results" \
  -v "$(pwd)/visual-diffs:/app/visual-diffs" \
  playwright-framework
```

## Troubleshooting Docker Issues

### Common Issues

1. **Docker not installed or not in PATH**
   - Install Docker following the instructions at https://docs.docker.com/get-docker/

2. **Docker daemon not running**
   - Start Docker daemon using your system's service manager
   - On Windows/Mac: Start Docker Desktop
   - On Linux: `sudo systemctl start docker`

3. **Permission issues**
   - Ensure your user has permissions to run Docker commands
   - On Linux: `sudo usermod -aG docker $USER` (requires logout/login)

4. **Network issues inside container**
   - Check if the container has network access
   - Try running with `--network=host` for troubleshooting

5. **Volume mount issues**
   - Ensure paths are absolute
   - Check permissions on host directories

### Debugging Docker Containers

To debug issues in Docker containers:

```bash
# Run container with interactive shell
docker run -it --rm playwright-framework bash

# Check environment variables
env

# Test network connectivity
curl -I https://example.com

# Check file system
ls -la /app
```

## CI/CD Integration

The framework includes GitHub Actions workflows for Docker-based testing:

- `.github/workflows/docker-test.yml`: Runs tests in Docker
- `.github/workflows/playwright.yml`: Includes Docker-based test execution

These workflows automatically build the Docker image and run tests in a containerized environment.

## Advanced Docker Usage

### Custom Dockerfile

You can create a custom Dockerfile based on the provided one:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Add your custom dependencies
RUN apt-get update && apt-get install -y \
    your-package-here \
    && apt-get clean

# Copy your application
COPY . .

# Set environment variables
ENV MY_CUSTOM_VAR=value

# Default command
CMD ["npx", "playwright", "test"]
```

### Multi-stage Builds

The framework's Dockerfile uses multi-stage builds to optimize the image size:

1. Builder stage: Installs build dependencies
2. Runtime stage: Contains only runtime dependencies

This approach results in smaller, more efficient Docker images.

## Best Practices

1. **Use volume mounts for reports and results** to persist data after the container exits
2. **Set appropriate environment variables** for test configuration
3. **Use Docker Compose** for complex test setups
4. **Tag Docker images** with meaningful names and versions
5. **Clean up unused Docker resources** regularly
6. **Use multi-stage builds** to keep images small
7. **Include only necessary files** in the Docker context

## Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Playwright Docker Documentation](https://playwright.dev/docs/docker)
- [Docker Compose Documentation](https://docs.docker.com/compose/)