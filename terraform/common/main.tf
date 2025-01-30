module "apkas" {
  source = "../../modules/apkas"

  api_ecr_repository_name = var.api_ecr_repository_name
}
