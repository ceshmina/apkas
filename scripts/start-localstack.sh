#!/bin/bash

set -e

echo "Starting LocalStack..."
docker compose up -d localstack

echo "Waiting for LocalStack to be ready..."
until curl -s http://localhost:4566/_localstack/health | grep -q "\"s3\": \"available\""; do
  echo "Waiting for LocalStack services to be ready..."
  sleep 2
done

echo "LocalStack is ready!"
echo "You can now run Terraform commands in the terraform/ directory"
echo "Example: cd terraform && terraform init && terraform plan"
