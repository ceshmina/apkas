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
terraform init
terraform plan
terraform apply
```

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
- `terraform/`: Terraform configuration files
  - `provider.tf`: AWS provider configuration for LocalStack
  - `variables.tf`: Common variables (project_name, environment, region)
  - `localstack/`: Directory for LocalStack initialization scripts

## Important Notes

- LocalStack runs without persistence to avoid volume mounting issues
- Use `docker compose` (not `docker-compose`) for container management
- Health checks should target the `_localstack/health` endpoint, not `/health`
- The setup is optimized for local development with minimal services enabled

## Code Style Rules

- Always add a newline at the end of files
- Write commit messages in English as concise single sentences
