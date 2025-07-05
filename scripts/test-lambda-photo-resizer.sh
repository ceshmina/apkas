#!/bin/bash

# Test script for Lambda photo resizer function
# This script uploads a test image to the original photos bucket and verifies
# that the resized image appears in the resized photos bucket

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ORIGINAL_BUCKET="apkas-dev-original-photos"
RESIZED_BUCKET="apkas-dev-resized-photos"
LOCALSTACK_ENDPOINT="http://localhost:4566"
TEST_DIR="abc"
TEST_IMAGE_NAME="test.jpg"
TEST_IMAGE_KEY="${TEST_DIR}/${TEST_IMAGE_NAME}"
TEST_IMAGE_PATH="/tmp/${TEST_IMAGE_NAME}"
RESIZED_LARGE_KEY="${TEST_DIR}/test/large.webp"
RESIZED_MEDIUM_KEY="${TEST_DIR}/test/medium.webp"
RESIZED_THUMBNAIL_KEY="${TEST_DIR}/test/thumbnail.webp"

echo "=== Lambda Photo Resizer Test ==="
echo "Original bucket: ${ORIGINAL_BUCKET}"
echo "Resized bucket: ${RESIZED_BUCKET}"
echo "Test image: ${TEST_IMAGE_KEY}"
echo "Expected resized images:"
echo "  - Large: ${RESIZED_LARGE_KEY}"
echo "  - Medium: ${RESIZED_MEDIUM_KEY}"  
echo "  - Thumbnail: ${RESIZED_THUMBNAIL_KEY}"
echo ""

# Check if LocalStack is running
echo "Checking LocalStack status..."
if ! curl -s "${LOCALSTACK_ENDPOINT}/_localstack/health" > /dev/null; then
    echo "❌ LocalStack is not running. Please start it first:"
    echo "   ./scripts/start-localstack.sh"
    exit 1
fi
echo "✅ LocalStack is running"

# Create test image file using Python script
echo "Creating test image file..."
if command -v python3 &> /dev/null && [ -f "${PROJECT_ROOT}/scripts/create-test-image.py" ]; then
    python3 "${PROJECT_ROOT}/scripts/create-test-image.py" "${TEST_IMAGE_PATH}"
    echo "✅ Test image created with Python: ${TEST_IMAGE_PATH}"
elif command -v convert &> /dev/null; then
    convert -size 100x100 xc:red "${TEST_IMAGE_PATH}"
    echo "✅ Test image created with ImageMagick: ${TEST_IMAGE_PATH}"
else
    echo "❌ Neither Python3 nor ImageMagick is available to create test image"
    echo "Please install Python3 with Pillow or ImageMagick to run this test"
    exit 1
fi

# Upload test image to original bucket
echo "Uploading test image to original bucket..."
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 cp "${TEST_IMAGE_PATH}" "s3://${ORIGINAL_BUCKET}/${TEST_IMAGE_KEY}"
echo "✅ Test image uploaded to s3://${ORIGINAL_BUCKET}/${TEST_IMAGE_KEY}"

# Wait for Lambda processing
echo "Waiting for Lambda function to process the image..."
sleep 5

# Check if resized images exist in resized bucket
echo "Checking for resized images in resized bucket..."

# Check for all three sizes
SIZES_FOUND=0
SIZES_TOTAL=3

echo "Checking large size..."
if aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${RESIZED_BUCKET}/${RESIZED_LARGE_KEY}" > /dev/null 2>&1; then
    echo "✅ Large image found: s3://${RESIZED_BUCKET}/${RESIZED_LARGE_KEY}"
    SIZES_FOUND=$((SIZES_FOUND + 1))
else
    echo "❌ Large image not found"
fi

echo "Checking medium size..."
if aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${RESIZED_BUCKET}/${RESIZED_MEDIUM_KEY}" > /dev/null 2>&1; then
    echo "✅ Medium image found: s3://${RESIZED_BUCKET}/${RESIZED_MEDIUM_KEY}"
    SIZES_FOUND=$((SIZES_FOUND + 1))
else
    echo "❌ Medium image not found"
fi

echo "Checking thumbnail size..."
if aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${RESIZED_BUCKET}/${RESIZED_THUMBNAIL_KEY}" > /dev/null 2>&1; then
    echo "✅ Thumbnail image found: s3://${RESIZED_BUCKET}/${RESIZED_THUMBNAIL_KEY}"
    SIZES_FOUND=$((SIZES_FOUND + 1))
else
    echo "❌ Thumbnail image not found"
fi

if [ $SIZES_FOUND -eq $SIZES_TOTAL ]; then
    echo ""
    echo "File details:"
    aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls "s3://${RESIZED_BUCKET}/${TEST_DIR}/test/" --recursive
    
    echo ""
    echo "🎉 Test PASSED - All ${SIZES_TOTAL} sizes created successfully!"
else
    echo ""
    echo "❌ Test PARTIALLY FAILED - Only ${SIZES_FOUND}/${SIZES_TOTAL} sizes found"
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
    
    if [ $SIZES_FOUND -eq 0 ]; then
        echo ""
        echo "❌ Test FAILED - Lambda function may not be working correctly"
        exit 1
    fi
fi

# Cleanup
echo ""
echo "Cleaning up test files..."
rm -f "${TEST_IMAGE_PATH}"
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 rm "s3://${ORIGINAL_BUCKET}/${TEST_IMAGE_KEY}" > /dev/null 2>&1 || true
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 rm "s3://${RESIZED_BUCKET}/${RESIZED_LARGE_KEY}" > /dev/null 2>&1 || true
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 rm "s3://${RESIZED_BUCKET}/${RESIZED_MEDIUM_KEY}" > /dev/null 2>&1 || true
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 rm "s3://${RESIZED_BUCKET}/${RESIZED_THUMBNAIL_KEY}" > /dev/null 2>&1 || true
echo "✅ Cleanup completed"

echo ""
echo "=== Test completed successfully ==="
