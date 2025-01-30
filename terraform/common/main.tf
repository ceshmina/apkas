module "apkas" {
  source = "../../modules/apkas"

  api_ecr_repository_name    = var.api_ecr_repository_name
  api_apprunner_service_name = var.api_apprunner_service_name
}
