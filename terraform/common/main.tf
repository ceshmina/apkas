module "apkas" {
  source = "../../modules/apkas"

  api_ecr_repository_name       = var.api_ecr_repository_name
  api_apprunner_service_name    = var.api_apprunner_service_name
  api_apprunner_max_concurrency = var.api_apprunner_max_concurrency
  api_apprunner_max_size        = var.api_apprunner_max_size
  api_apprunner_min_size        = var.api_apprunner_min_size
}
