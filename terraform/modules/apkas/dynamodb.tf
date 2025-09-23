resource "aws_dynamodb_table" "diary" {
  name = "diary"

  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "pid"
  range_key = "sid"

  attribute {
    name = "pid"
    type = "S"
  }
  attribute {
    name = "sid"
    type = "S"
  }
  attribute {
    name = "item_type"
    type = "S"
  }
  attribute {
    name = "created_at"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI2"
    hash_key        = "item_type"
    range_key       = "created_at"
    projection_type = "ALL"
  }
}
