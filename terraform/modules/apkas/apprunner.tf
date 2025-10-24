resource "aws_secretsmanager_secret" "admin" {
  name = "admin"
}

resource "aws_apprunner_service" "admin" {
  service_name = "admin"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.admin_auth.arn
    }
    image_repository {
      image_identifier      = "${aws_ecr_repository.admin.repository_url}:latest"
      image_repository_type = "ECR"
      image_configuration {
        port = "4000"
        runtime_environment_variables = {
          PHOTOS_ORIGINAL_BUCKET = aws_s3_bucket.photos_original.bucket
        }
        runtime_environment_secrets = {
          GOOGLE_CLIENT_ID     = "${aws_secretsmanager_secret.admin.arn}:GOOGLE_CLIENT_ID::"
          GOOGLE_CLIENT_SECRET = "${aws_secretsmanager_secret.admin.arn}:GOOGLE_CLIENT_SECRET::"
          NEXTAUTH_SECRET      = "${aws_secretsmanager_secret.admin.arn}:NEXTAUTH_SECRET::"
          NEXTAUTH_URL         = "${aws_secretsmanager_secret.admin.arn}:NEXTAUTH_URL::"
        }
      }
    }
    auto_deployments_enabled = true
  }

  instance_configuration {
    instance_role_arn = aws_iam_role.admin.arn

    cpu    = "0.25 vCPU"
    memory = "0.5 GB"
  }

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.admin.arn
}

resource "aws_apprunner_custom_domain_association" "admin" {
  service_arn = aws_apprunner_service.admin.arn
  domain_name = "admin.${var.domain}"
}

resource "aws_apprunner_auto_scaling_configuration_version" "admin" {
  auto_scaling_configuration_name = "admin"

  max_concurrency = 100
  max_size        = 1
  min_size        = 1
}
