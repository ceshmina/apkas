resource "aws_ecr_repository" "api" {
  name = var.api_ecr_repository_name
}
