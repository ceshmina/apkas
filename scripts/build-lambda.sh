#!/bin/bash

# Build Lambda function package using Docker
# This script builds the Lambda function package without polluting the host with Python libraries

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAMBDA_DIR="${PROJECT_ROOT}/lambda"
OUTPUT_DIR="${PROJECT_ROOT}/terraform"

echo "=== Building Lambda function package ==="
echo "Project root: ${PROJECT_ROOT}"
echo "Lambda directory: ${LAMBDA_DIR}"
echo "Output directory: ${OUTPUT_DIR}"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not available. Please install Docker first."
    exit 1
fi

# Check if Lambda directory exists
if [ ! -d "${LAMBDA_DIR}" ]; then
    echo "❌ Lambda directory not found: ${LAMBDA_DIR}"
    exit 1
fi

# Check if requirements.txt exists
if [ ! -f "${LAMBDA_DIR}/requirements.txt" ]; then
    echo "❌ requirements.txt not found: ${LAMBDA_DIR}/requirements.txt"
    exit 1
fi

# Check if photo_resizer.py exists
if [ ! -f "${LAMBDA_DIR}/photo_resizer.py" ]; then
    echo "❌ photo_resizer.py not found: ${LAMBDA_DIR}/photo_resizer.py"
    exit 1
fi

echo "Building Lambda package using Docker..."

# Build the Docker image
docker build -t lambda-builder "${LAMBDA_DIR}"

# Run the container to build the package
docker run --rm -v "${OUTPUT_DIR}:/output" lambda-builder

# Check if the package was created
if [ -f "${OUTPUT_DIR}/lambda.zip" ]; then
    echo "✅ Lambda package created successfully: ${OUTPUT_DIR}/lambda.zip"
    
    # Show package size
    PACKAGE_SIZE=$(ls -lh "${OUTPUT_DIR}/lambda.zip" | awk '{print $5}')
    echo "Package size: ${PACKAGE_SIZE}"
    
    # Show package contents
    echo ""
    echo "Package contents:"
    unzip -l "${OUTPUT_DIR}/lambda.zip" | head -20
    
else
    echo "❌ Failed to create Lambda package"
    exit 1
fi

echo ""
echo "=== Build completed successfully ==="
echo "You can now run 'terraform apply' to deploy the updated Lambda function."
