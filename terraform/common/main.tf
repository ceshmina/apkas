module "apkas" {
  source = "../../modules/apkas"
  providers = {
    aws          = aws
    aws.virginia = aws.virginia
  }

  name       = var.name
  aws_region = var.aws_region

  aws_availability_zones = var.aws_availability_zones

  route53_zone_name = var.route53_zone_name

  api_ecr_repository_name       = var.api_ecr_repository_name
  api_apprunner_service_name    = var.api_apprunner_service_name
  api_apprunner_max_concurrency = var.api_apprunner_max_concurrency
  api_apprunner_max_size        = var.api_apprunner_max_size
  api_apprunner_min_size        = var.api_apprunner_min_size

  aurora_max_size                 = var.aurora_max_size
  aurora_min_size                 = var.aurora_min_size
  aurora_seconds_until_auto_pause = var.aurora_seconds_until_auto_pause
}
