resource "aws_dynamodb_table" "photo_metadata" {
  name           = "${var.project_name}-${var.environment}-photo-metadata"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "photo_id"
  range_key      = "created_at"

  attribute {
    name = "photo_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  attribute {
    name = "original_bucket"
    type = "S"
  }

  attribute {
    name = "original_key"
    type = "S"
  }

  global_secondary_index {
    name            = "original-bucket-key-index"
    hash_key        = "original_bucket"
    range_key       = "original_key"
    projection_type = "ALL"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-photo-metadata"
    Environment = var.environment
    Project     = var.project_name
  }
}
