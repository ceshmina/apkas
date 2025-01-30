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
}
