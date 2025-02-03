module "apkas" {
  source = "../../modules/apkas"

  name = var.name

  route53_zone_name = var.route53_zone_name

  api_ecr_repository_name       = var.api_ecr_repository_name
  api_apprunner_service_name    = var.api_apprunner_service_name
  api_apprunner_max_concurrency = var.api_apprunner_max_concurrency
  api_apprunner_max_size        = var.api_apprunner_max_size
  api_apprunner_min_size        = var.api_apprunner_min_size
}
