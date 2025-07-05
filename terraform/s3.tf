resource "aws_s3_bucket" "original_photos" {
  bucket = "${var.project_name}-${var.environment}-original-photos"
}

resource "aws_s3_bucket" "resized_photos" {
  bucket = "${var.project_name}-${var.environment}-resized-photos"
}

resource "aws_s3_bucket_versioning" "original_photos" {
  bucket = aws_s3_bucket.original_photos.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_versioning" "resized_photos" {
  bucket = aws_s3_bucket.resized_photos.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "original_photos" {
  bucket = aws_s3_bucket.original_photos.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "resized_photos" {
  bucket = aws_s3_bucket.resized_photos.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
