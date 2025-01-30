data "aws_iam_policy_document" "apprunner_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["build.apprunner.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "apprunner" {
  name               = "apprunner-api"
  assume_role_policy = data.aws_iam_policy_document.apprunner_assume_role.json
}

resource "aws_iam_role_policy_attachment" "apprunner" {
  role       = aws_iam_role.apprunner.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_apprunner_service" "api" {
  service_name = var.api_apprunner_service_name
  source_configuration {
    image_repository {
      image_repository_type = "ECR"
      image_identifier      = "${aws_ecr_repository.api.repository_url}:latest"
      image_configuration {
        port = "8000"
      }
    }
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner.arn
    }
  }
  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.api.arn
  instance_configuration {
    cpu    = "256"
    memory = "512"
  }
}

resource "aws_apprunner_auto_scaling_configuration_version" "api" {
  auto_scaling_configuration_name = "default"
  max_concurrency                 = var.api_apprunner_max_concurrency
  max_size                        = var.api_apprunner_max_size
  min_size                        = var.api_apprunner_min_size
}

resource "aws_apprunner_custom_domain_association" "api" {
  service_arn          = aws_apprunner_service.api.arn
  domain_name          = "api.${var.route53_zone_name}"
  enable_www_subdomain = false
}
