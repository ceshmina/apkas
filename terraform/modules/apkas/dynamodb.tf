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
}
