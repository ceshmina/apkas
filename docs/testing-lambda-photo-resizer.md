# Testing Lambda Photo Resizer Function

This document describes how to test the Lambda photo resizer function both automatically and manually.

## Automated Testing

### Prerequisites
- LocalStack must be running
- AWS CLI must be configured
- Terraform infrastructure must be deployed

### Running the Automated Test
```bash
./scripts/test-lambda-photo-resizer.sh
```

The automated test will:
1. Check LocalStack status
2. Create a test image file
3. Upload it to the original photos bucket
4. Wait for Lambda processing
5. Verify the resized image appears in the resized bucket
6. Clean up test files

### Expected Output
```
=== Lambda Photo Resizer Test ===
Original bucket: apkas-dev-original-photos
Resized bucket: apkas-dev-resized-photos
Test image: test_photo_1720186795.jpg

✅ LocalStack is running
✅ Test image created: /tmp/test_photo_1720186795.jpg
✅ Test image uploaded to s3://apkas-dev-original-photos/test_photo_1720186795.jpg
Waiting for Lambda function to process the image...
✅ Resized image found: s3://apkas-dev-resized-photos/resized_test_photo_1720186795.jpg

File details:
2025-07-05 16:46:35         28 resized_test_photo_1720186795.jpg

🎉 Test PASSED - Lambda function is working correctly!

✅ Cleanup completed

=== Test completed successfully ===
```

## Manual Testing

### Step 1: Prepare Test Environment
1. Start LocalStack:
   ```bash
   ./scripts/start-localstack.sh
   ```

2. Deploy infrastructure:
   ```bash
   cd terraform
   mise exec -- terraform apply
   ```

### Step 2: Create Test Image
Create a test image file:
```bash
echo "Test image content - $(date)" > /tmp/test_photo.jpg
```

### Step 3: Upload Test Image
Upload to the original photos bucket:
```bash
aws --endpoint-url=http://localhost:4566 s3 cp /tmp/test_photo.jpg s3://apkas-dev-original-photos/
```

### Step 4: Verify Processing
Wait a few seconds, then check if the resized image was created:
```bash
aws --endpoint-url=http://localhost:4566 s3 ls s3://apkas-dev-resized-photos/
```

You should see a file named `resized_test_photo.jpg`.

### Step 5: Verify File Contents (Optional)
Download and inspect the resized image:
```bash
aws --endpoint-url=http://localhost:4566 s3 cp s3://apkas-dev-resized-photos/resized_test_photo.jpg /tmp/
cat /tmp/resized_test_photo.jpg
```

### Step 6: Clean Up
Remove test files:
```bash
rm -f /tmp/test_photo.jpg /tmp/resized_test_photo.jpg
aws --endpoint-url=http://localhost:4566 s3 rm s3://apkas-dev-original-photos/test_photo.jpg
aws --endpoint-url=http://localhost:4566 s3 rm s3://apkas-dev-resized-photos/resized_test_photo.jpg
```

## Testing Different File Types

The Lambda function supports JPG and JPEG files (case-insensitive). Test with different extensions:

```bash
# Test with .jpg
echo "Test JPG" > /tmp/test.jpg
aws --endpoint-url=http://localhost:4566 s3 cp /tmp/test.jpg s3://apkas-dev-original-photos/

# Test with .jpeg
echo "Test JPEG" > /tmp/test.jpeg
aws --endpoint-url=http://localhost:4566 s3 cp /tmp/test.jpeg s3://apkas-dev-original-photos/

# Test with .JPG (uppercase)
echo "Test JPG uppercase" > /tmp/test.JPG
aws --endpoint-url=http://localhost:4566 s3 cp /tmp/test.JPG s3://apkas-dev-original-photos/

# Test with .JPEG (uppercase)
echo "Test JPEG uppercase" > /tmp/test.JPEG
aws --endpoint-url=http://localhost:4566 s3 cp /tmp/test.JPEG s3://apkas-dev-original-photos/
```

## Troubleshooting

### Lambda Function Not Triggering
1. Check LocalStack logs:
   ```bash
   docker logs localstack
   ```

2. Verify S3 bucket notifications:
   ```bash
   aws --endpoint-url=http://localhost:4566 s3api get-bucket-notification-configuration --bucket apkas-dev-original-photos
   ```

3. Check Lambda function exists:
   ```bash
   aws --endpoint-url=http://localhost:4566 lambda list-functions
   ```

### Lambda Function Errors
1. Check Lambda logs (if available):
   ```bash
   aws --endpoint-url=http://localhost:4566 logs describe-log-groups --log-group-name-prefix "/aws/lambda/apkas-dev-photo-resizer"
   ```

2. Verify Lambda function configuration:
   ```bash
   aws --endpoint-url=http://localhost:4566 lambda get-function --function-name apkas-dev-photo-resizer
   ```

### File Not Processing
1. Ensure file extension is supported (.jpg, .jpeg, .JPG, .JPEG)
2. Check if file was uploaded successfully
3. Verify Lambda function permissions
4. Check LocalStack service health

## Current Implementation Note

The current Lambda function performs a simple copy operation as a placeholder. The actual image resizing logic using the Pillow library needs to be implemented to process images properly.
