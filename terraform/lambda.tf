# Lambda function package built via Docker
# Run './scripts/build-lambda.sh' to build the package before applying Terraform
data "local_file" "photo_resizer_zip" {
  filename = "${path.module}/lambda.zip"
}

# Lambda function
resource "aws_lambda_function" "photo_resizer" {
  filename         = data.local_file.photo_resizer_zip.filename
  function_name    = "${var.project_name}-${var.environment}-photo-resizer"
  role            = aws_iam_role.lambda_role.arn
  handler         = "photo_resizer.lambda_handler"
  runtime         = "python3.11"
  timeout         = 30
  memory_size     = 1024

  source_code_hash = data.local_file.photo_resizer_zip.content_base64sha256

  architectures = ["arm64"]


  environment {
    variables = {
      DESTINATION_BUCKET = aws_s3_bucket.resized_photos.bucket
      DYNAMODB_TABLE     = aws_dynamodb_table.photo_metadata.name
    }
  }
}

# Note: IAM roles are not fully supported in LocalStack Community Edition
# Using a dummy role ARN for LocalStack development

# Lambda permission for S3 to invoke the function
resource "aws_lambda_permission" "allow_s3_invoke" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.photo_resizer.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.original_photos.arn
}
