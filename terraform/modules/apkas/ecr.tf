resource "aws_ecr_repository" "admin" {
  name                 = "admin"
  image_tag_mutability = "MUTABLE"
}
