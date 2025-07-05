# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo setup for local AWS development using LocalStack and Terraform. The project targets the ap-northeast-1 (Tokyo) region and currently supports S3 and Lambda services.

## Local Development Setup

### Starting LocalStack
```bash
./scripts/start-localstack.sh
```
This script starts LocalStack via Docker Compose and waits for S3 and Lambda services to be available.

### Terraform Operations
```bash
cd terraform
mise exec -- terraform init
mise exec -- terraform plan
mise exec -- terraform apply
```

Note: Terraform is managed by mise. Use `mise exec -- terraform` to run terraform commands.

## Architecture

### LocalStack Configuration
- **Services**: S3 and Lambda only
- **Endpoint**: http://localhost:4566
- **Persistence**: Disabled (PERSISTENCE=0)
- **Health Check**: Use `http://localhost:4566/_localstack/health` endpoint

### Terraform Setup
- **Provider**: AWS provider configured for LocalStack endpoints
- **Region**: ap-northeast-1 (Tokyo)
- **Test Credentials**: Uses dummy credentials for LocalStack
- **Skip Validation**: All AWS credential validations are disabled for local development

### Directory Structure
- `compose.yml`: LocalStack Docker Compose configuration
- `scripts/`: Utility scripts for development
  - `start-localstack.sh`: Start LocalStack services
  - `build-lambda.sh`: Build Lambda package using Docker (prevents host pollution)
  - `test-lambda-photo-resizer.sh`: Automated test for Lambda function
  - `create-test-image.py`: Generate test JPEG images for testing
- `terraform/`: Terraform configuration files
  - `provider.tf`: AWS provider configuration for LocalStack
  - `variables.tf`: Common variables (project_name, environment, region)
  - `s3.tf`: S3 bucket configurations and notifications
  - `lambda.tf`: Lambda function configuration
  - `localstack/`: Directory for LocalStack initialization scripts
- `lambda/`: Lambda function source code
  - `photo_resizer.py`: Main Lambda function for photo resizing (abc/test.jpg → abc/test/medium.webp)
  - `requirements.txt`: Python dependencies
  - `Dockerfile`: Docker build environment for Lambda package
- `docs/`: Documentation
  - `testing-lambda-photo-resizer.md`: Testing procedures for Lambda function

## Development Workflow

### 1. Start LocalStack
```bash
./scripts/start-localstack.sh
```

### 2. Build Lambda Package (when Lambda code changes)
```bash
./scripts/build-lambda.sh
```

### 3. Deploy Infrastructure
```bash
cd terraform
mise exec -- terraform apply
```

### 4. Test the System
```bash
./scripts/test-lambda-photo-resizer.sh
```

## Testing

### Automated Testing
Run the automated test script to verify Lambda function functionality:
```bash
./scripts/test-lambda-photo-resizer.sh
```

This script:
1. Creates a test JPEG image using Python
2. Uploads it to `s3://apkas-dev-original-photos/abc/test.jpg`
3. Waits for Lambda processing
4. Verifies the resized images at `s3://apkas-dev-resized-photos/abc/test/medium.webp`
5. Cleans up test files

**Note**: Lambda function creates 3 sizes for each uploaded image:
- `large.webp`: Long edge max 3840px (quality 90%)
- `medium.webp`: Long edge max 1920px (quality 85%)
- `thumbnail.webp`: Long edge max 240px (quality 80%)

### Manual Testing
For detailed manual testing procedures, see: `docs/testing-lambda-photo-resizer.md`

## Important Notes

- **Lambda Build**: Always use `./scripts/build-lambda.sh` to build Lambda packages to avoid Python library pollution on the host
- **LocalStack**: Runs without persistence to avoid volume mounting issues
- **Docker**: Use `docker compose` (not `docker-compose`) for container management
- **Health Checks**: Target the `_localstack/health` endpoint, not `/health`
- **Image Processing**: Lambda function converts `abc/test.jpg` → `abc/test/large.webp` (3840px), `abc/test/medium.webp` (1920px), `abc/test/thumbnail.webp` (240px) - ARM64 optimized
- **Dependencies**: Python libraries are installed in Docker container and not exposed to host filesystem

## Code Style Rules

- Always add a newline at the end of files
- Write commit messages in English as concise single sentences
- Always execute git commands from the project root directory
