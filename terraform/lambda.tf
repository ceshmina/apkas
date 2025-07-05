# ZIP the Lambda function code
data "archive_file" "photo_resizer_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda"
  output_path = "${path.module}/photo_resizer.zip"
}

# Lambda function
resource "aws_lambda_function" "photo_resizer" {
  filename         = data.archive_file.photo_resizer_zip.output_path
  function_name    = "${var.project_name}-${var.environment}-photo-resizer"
  role            = "arn:aws:iam::000000000000:role/lambda-role"
  handler         = "photo_resizer.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  memory_size     = 256

  source_code_hash = data.archive_file.photo_resizer_zip.output_base64sha256

  environment {
    variables = {
      DESTINATION_BUCKET = aws_s3_bucket.resized_photos.bucket
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
