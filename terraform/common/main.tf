module "api" {
  source = "../../modules/api"

  api_ecr_repository_name = var.api_ecr_repository_name
}
