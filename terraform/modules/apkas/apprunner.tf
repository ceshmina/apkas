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

data "aws_iam_policy_document" "apprunner_instance" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["tasks.apprunner.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "apprunner_instance" {
  name               = "apprunner-api-instance"
  assume_role_policy = data.aws_iam_policy_document.apprunner_instance.json
}

data "aws_iam_policy_document" "apprunner_secrets" {
  statement {
    sid       = "ForGetSecretValue"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.aurora_user.arn]
  }
}

resource "aws_iam_role_policy" "apprunner_secrets" {
  name   = "apprunner-secrets"
  role   = aws_iam_role.apprunner_instance.name
  policy = data.aws_iam_policy_document.apprunner_secrets.json
}

resource "aws_apprunner_service" "api" {
  service_name = var.api_apprunner_service_name
  source_configuration {
    image_repository {
      image_repository_type = "ECR"
      image_identifier      = "${aws_ecr_repository.api.repository_url}:latest"
      image_configuration {
        port = "8000"
        runtime_environment_variables = {
          DB_HOST = aws_rds_cluster.aurora.endpoint
          DB_PORT = 5432
          DB_NAME = "apkas"
        }
        runtime_environment_secrets = {
          DB_USER     = "${aws_secretsmanager_secret_version.aurora_user_value.arn}:username::"
          DB_PASSWORD = "${aws_secretsmanager_secret_version.aurora_user_value.arn}:password::"
        }
      }
    }
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner.arn
    }
  }
  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.api.arn
  instance_configuration {
    cpu               = "256"
    memory            = "512"
    instance_role_arn = aws_iam_role.apprunner_instance.arn
  }
  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.apprunner.arn
    }
  }
  health_check_configuration {
    timeout             = 5
    unhealthy_threshold = 20
    interval            = 10
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

resource "aws_security_group" "apprunner" {
  name   = "${var.name}-apprunner"
  vpc_id = aws_vpc.this.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_apprunner_vpc_connector" "apprunner" {
  vpc_connector_name = "apprunner-vpc-connector"
  subnets            = [aws_subnet.private_1.id, aws_subnet.private_2.id]
  security_groups    = [aws_security_group.apprunner.id]
  tags = {
    Name = "apprunner-vpc-connector"
  }
}
