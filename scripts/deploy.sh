#!/bin/bash

# Deployment script for different environments
# Usage: ./scripts/deploy.sh [local|staging|prod] [plan|apply|destroy]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TERRAFORM_DIR="${PROJECT_ROOT}/terraform"

# Default values
ENVIRONMENT="local"
ACTION="plan"

# Parse arguments
if [ $# -ge 1 ]; then
    ENVIRONMENT="$1"
fi

if [ $# -ge 2 ]; then
    ACTION="$2"
fi

# Validate environment
case "$ENVIRONMENT" in
    local|staging|prod)
        ;;
    *)
        echo "❌ Invalid environment: $ENVIRONMENT"
        echo "Valid environments: local, staging, prod"
        exit 1
        ;;
esac

# Validate action
case "$ACTION" in
    plan|apply|destroy)
        ;;
    *)
        echo "❌ Invalid action: $ACTION"
        echo "Valid actions: plan, apply, destroy"
        exit 1
        ;;
esac

echo "=== Deploying to $ENVIRONMENT environment ==="
echo "Action: $ACTION"
echo "Project root: $PROJECT_ROOT"
echo "Terraform directory: $TERRAFORM_DIR"
echo ""

# Change to terraform directory
cd "$TERRAFORM_DIR"

# For local environment, ensure LocalStack is running
if [ "$ENVIRONMENT" = "local" ]; then
    echo "Checking LocalStack status..."
    if ! curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
        echo "❌ LocalStack is not running. Please start it first:"
        echo "   ./scripts/start-localstack.sh"
        exit 1
    fi
    echo "✅ LocalStack is running"
fi

# Build Lambda package if needed
if [ "$ACTION" = "apply" ] || [ "$ACTION" = "plan" ]; then
    echo "Building Lambda package..."
    "${PROJECT_ROOT}/scripts/build-lambda.sh"
fi

# Set terraform variables file
TFVARS_FILE="terraform.tfvars.$ENVIRONMENT"

if [ ! -f "$TFVARS_FILE" ]; then
    echo "❌ Variables file not found: $TFVARS_FILE"
    exit 1
fi

echo "Using variables file: $TFVARS_FILE"

# Initialize terraform with backend configuration
echo "Initializing Terraform..."
if [ "$ENVIRONMENT" = "local" ]; then
    # LocalStack uses local state file
    mise exec -- terraform init -reconfigure
else
    # AWS environments use S3 backend
    BACKEND_CONFIG="backend.$ENVIRONMENT.hcl"
    if [ ! -f "$BACKEND_CONFIG" ]; then
        echo "❌ Backend configuration file not found: $BACKEND_CONFIG"
        exit 1
    fi
    echo "Using backend configuration: $BACKEND_CONFIG"
    mise exec -- terraform init -reconfigure -backend-config="$BACKEND_CONFIG"
fi

# Execute terraform command
case "$ACTION" in
    plan)
        echo "Planning deployment..."
        mise exec -- terraform plan -var-file="$TFVARS_FILE"
        ;;
    apply)
        echo "Applying deployment..."
        mise exec -- terraform apply -var-file="$TFVARS_FILE" -auto-approve
        ;;
    destroy)
        echo "Destroying infrastructure..."
        mise exec -- terraform destroy -var-file="$TFVARS_FILE" -auto-approve
        ;;
esac

echo ""
echo "=== Deployment completed successfully ==="

# Show outputs for apply action
if [ "$ACTION" = "apply" ]; then
    echo ""
    echo "=== Terraform Outputs ==="
    mise exec -- terraform output
fi