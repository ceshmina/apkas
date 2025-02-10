resource "aws_s3_bucket" "frontend" {
  bucket = "${var.name}-frontend"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.bucket

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.bucket
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "404.html"
  }
}

data "aws_iam_policy_document" "frontend" {
  statement {
    sid    = "ForPublicAccess"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend.json
}
