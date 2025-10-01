data "archive_file" "dummy_lambda" {
  type        = "zip"
  output_path = "${path.module}/dummy_lambda.zip"
  source {
    content  = "dummy"
    filename = "main.py"
  }
}

resource "aws_iam_role" "lambda_execute" {
  name = "lambda-execute"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

data "aws_iam_policy_document" "lambda_execute_data" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
    ]
    resources = [
      "${aws_s3_bucket.photos_original.arn}/*",
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:putObject",
    ]
    resources = [
      "${aws_s3_bucket.photos.arn}/*",
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
    ]
    resources = [
      aws_dynamodb_table.diary.arn,
    ]
  }
}

resource "aws_iam_role_policy_attachment" "lambda_execute" {
  role       = aws_iam_role.lambda_execute.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "lambda_execute_data" {
  name   = "lambda-execute-data"
  policy = data.aws_iam_policy_document.lambda_execute_data.json
}

resource "aws_iam_role_policy_attachment" "lambda_execute_data" {
  role       = aws_iam_role.lambda_execute.name
  policy_arn = aws_iam_policy.lambda_execute_data.arn
}

resource "aws_lambda_function" "process_photo" {
  function_name = "process-photo"
  runtime       = "python3.13"
  role          = aws_iam_role.lambda_execute.arn
  filename      = data.archive_file.dummy_lambda.output_path
  handler       = "main.handler"

  lifecycle {
    ignore_changes = all
  }
}
