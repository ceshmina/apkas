#!/bin/bash

# Test script for Lambda photo resizer function
# This script uploads a test image to the original photos bucket and verifies
# that the resized image appears in the resized photos bucket

set -e

# Configuration
ORIGINAL_BUCKET="apkas-dev-original-photos"
RESIZED_BUCKET="apkas-dev-resized-photos"
LOCALSTACK_ENDPOINT="http://localhost:4566"
TEST_DIR="abc"
TEST_IMAGE_NAME="test.jpg"
TEST_IMAGE_KEY="${TEST_DIR}/${TEST_IMAGE_NAME}"
TEST_IMAGE_PATH="/tmp/${TEST_IMAGE_NAME}"
RESIZED_IMAGE_NAME="medium.webp"
RESIZED_IMAGE_KEY="${TEST_DIR}/test/${RESIZED_IMAGE_NAME}"

echo "=== Lambda Photo Resizer Test ==="
echo "Original bucket: ${ORIGINAL_BUCKET}"
echo "Resized bucket: ${RESIZED_BUCKET}"
echo "Test image: ${TEST_IMAGE_KEY}"
echo "Expected resized image: ${RESIZED_IMAGE_KEY}"
echo ""

# Check if LocalStack is running
echo "Checking LocalStack status..."
if ! curl -s "${LOCALSTACK_ENDPOINT}/_localstack/health" > /dev/null; then
    echo "❌ LocalStack is not running. Please start it first:"
    echo "   ./scripts/start-localstack.sh"
    exit 1
fi
echo "✅ LocalStack is running"

# Create test image file (create a small PNG and convert to JPEG)
echo "Creating test image file..."
# Create a simple test image using ImageMagick if available, otherwise use a dummy file
if command -v convert &> /dev/null; then
    convert -size 100x100 xc:red "${TEST_IMAGE_PATH}"
    echo "✅ Test image created with ImageMagick: ${TEST_IMAGE_PATH}"
else
    # Create a dummy JPEG file header for testing
    printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\x27 \x20\x2c\x20\x1c\x1c(7),01444\x1f\x27=9=82<.342\xff\xc0\x00\x11\x08\x00d\x00d\x03\x01\x22\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\x00\xff\xd9' > "${TEST_IMAGE_PATH}"
    echo "✅ Test image created (dummy JPEG): ${TEST_IMAGE_PATH}"
fi

# Upload test image to original bucket
echo "Uploading test image to original bucket..."
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 cp "${TEST_IMAGE_PATH}" "s3://${ORIGINAL_BUCKET}/${TEST_IMAGE_KEY}"
echo "✅ Test image uploaded to s3://${ORIGINAL_BUCKET}/${TEST_IMAGE_KEY}"

# Wait for Lambda processing
echo "Waiting for Lambda function to process the image..."
sleep 5

# Check if resized image exists in resized bucket
echo "Checking for resized image in resized bucket..."
if aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${RESIZED_BUCKET}/${RESIZED_IMAGE_KEY}" > /dev/null 2>&1; then
    echo "✅ Resized image found: s3://${RESIZED_BUCKET}/${RESIZED_IMAGE_KEY}"
    
    # Show file details
    echo ""
    echo "File details:"
    aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${RESIZED_BUCKET}/${RESIZED_IMAGE_KEY}"
    
    echo ""
    echo "🎉 Test PASSED - Lambda function is working correctly!"
else
    echo "❌ Resized image not found in resized bucket"
    echo ""
    echo "Debugging information:"
    echo "Original bucket contents:"
    aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${ORIGINAL_BUCKET}/" --recursive
    echo ""
    echo "Resized bucket contents:"
    aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${RESIZED_BUCKET}/" --recursive
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
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 rm "s3://${ORIGINAL_BUCKET}/${TEST_IMAGE_KEY}" > /dev/null 2>&1 || true
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 rm "s3://${RESIZED_BUCKET}/${RESIZED_IMAGE_KEY}" > /dev/null 2>&1 || true
echo "✅ Cleanup completed"

echo ""
echo "=== Test completed successfully ==="
