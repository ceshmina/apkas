resource "aws_s3_bucket" "photos" {
  bucket = "apkas-${var.env}-photos"
}

resource "aws_s3_bucket_public_access_block" "photos" {
  bucket = aws_s3_bucket.photos.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "photos_original" {
  bucket = "apkas-${var.env}-photos-original"
}

resource "aws_s3_bucket_public_access_block" "photos_original" {
  bucket = aws_s3_bucket.photos_original.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "photos_original" {
  bucket = aws_s3_bucket.photos_original.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST"]
    allowed_origins = [
      "https://admin.${var.domain}",
    ]
    max_age_seconds = 3600
  }
}

resource "aws_s3_bucket" "frontend" {
  bucket = "apkas-${var.env}-frontend"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "for_cloudfront" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "ArnLike"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.for_cloudfront.json
}

data "aws_iam_policy_document" "photos_for_cloudfront" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.photos.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "ArnLike"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.photos.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "photos" {
  bucket = aws_s3_bucket.photos.id
  policy = data.aws_iam_policy_document.photos_for_cloudfront.json
}
