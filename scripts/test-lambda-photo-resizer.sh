#!/bin/bash

# Test script for Lambda photo resizer function
# This script uploads a test image to the original photos bucket and verifies
# that the resized image appears in the resized photos bucket

set -e

# Configuration
ORIGINAL_BUCKET="apkas-dev-original-photos"
RESIZED_BUCKET="apkas-dev-resized-photos"
LOCALSTACK_ENDPOINT="http://localhost:4566"
TEST_IMAGE_NAME="test_photo_$(date +%s).jpg"
TEST_IMAGE_PATH="/tmp/${TEST_IMAGE_NAME}"
RESIZED_IMAGE_NAME="resized_${TEST_IMAGE_NAME}"

echo "=== Lambda Photo Resizer Test ==="
echo "Original bucket: ${ORIGINAL_BUCKET}"
echo "Resized bucket: ${RESIZED_BUCKET}"
echo "Test image: ${TEST_IMAGE_NAME}"
echo ""

# Check if LocalStack is running
echo "Checking LocalStack status..."
if ! curl -s "${LOCALSTACK_ENDPOINT}/_localstack/health" > /dev/null; then
    echo "❌ LocalStack is not running. Please start it first:"
    echo "   ./scripts/start-localstack.sh"
    exit 1
fi
echo "✅ LocalStack is running"

# Create test image file
echo "Creating test image file..."
echo "Test image content - $(date)" > "${TEST_IMAGE_PATH}"
echo "✅ Test image created: ${TEST_IMAGE_PATH}"

# Upload test image to original bucket
echo "Uploading test image to original bucket..."
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 cp "${TEST_IMAGE_PATH}" "s3://${ORIGINAL_BUCKET}/"
echo "✅ Test image uploaded to s3://${ORIGINAL_BUCKET}/${TEST_IMAGE_NAME}"

# Wait for Lambda processing
echo "Waiting for Lambda function to process the image..."
sleep 5

# Check if resized image exists in resized bucket
echo "Checking for resized image in resized bucket..."
if aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${RESIZED_BUCKET}/${RESIZED_IMAGE_NAME}" > /dev/null 2>&1; then
    echo "✅ Resized image found: s3://${RESIZED_BUCKET}/${RESIZED_IMAGE_NAME}"
    
    # Show file details
    echo ""
    echo "File details:"
    aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${RESIZED_BUCKET}/${RESIZED_IMAGE_NAME}"
    
    echo ""
    echo "🎉 Test PASSED - Lambda function is working correctly!"
else
    echo "❌ Resized image not found in resized bucket"
    echo ""
    echo "Debugging information:"
    echo "Original bucket contents:"
    aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${ORIGINAL_BUCKET}/"
    echo ""
    echo "Resized bucket contents:"
    aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${RESIZED_BUCKET}/"
    echo ""
    echo "Lambda function logs (if available):"
    aws --endpoint-url="${LOCALSTACK_ENDPOINT}" logs describe-log-groups --log-group-name-prefix "/aws/lambda/apkas-dev-photo-resizer" 2>/dev/null || echo "No logs available"
    
    echo ""
    echo "❌ Test FAILED - Lambda function may not be working correctly"
    exit 1
fi

# Cleanup
echo ""
echo "Cleaning up test files..."
rm -f "${TEST_IMAGE_PATH}"
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 rm "s3://${ORIGINAL_BUCKET}/${TEST_IMAGE_NAME}" > /dev/null 2>&1 || true
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 rm "s3://${RESIZED_BUCKET}/${RESIZED_IMAGE_NAME}" > /dev/null 2>&1 || true
echo "✅ Cleanup completed"

echo ""
echo "=== Test completed successfully ==="
