resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
  client_id_list = [
    "sts.amazonaws.com",
  ]
}

data "aws_iam_policy_document" "read_dynamodb" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:GetItem",
    ]
    resources = [
      aws_dynamodb_table.diary.arn,
      "${aws_dynamodb_table.diary.arn}/index/*"
    ]
  }
}

resource "aws_iam_policy" "read_dynamodb" {
  name   = "read-dynamodb"
  policy = data.aws_iam_policy_document.read_dynamodb.json
}

data "aws_iam_policy_document" "sync_s3" {
  statement {
    effect = "Allow"
    actions = [
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.frontend.arn,
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = [
      "${aws_s3_bucket.frontend.arn}/*",
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
    ]
    resources = [
      aws_cloudfront_distribution.frontend.arn,
    ]
  }
}

resource "aws_iam_policy" "sync_s3" {
  name   = "sync-s3"
  policy = data.aws_iam_policy_document.sync_s3.json
}

data "aws_iam_policy_document" "push_ecr" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ecr:CompleteLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:InitiateLayerUpload",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
    ]
    resources = [
      aws_ecr_repository.admin.arn,
    ]
  }
}

resource "aws_iam_policy" "push_ecr" {
  name   = "push-ecr"
  policy = data.aws_iam_policy_document.push_ecr.json
}

resource "aws_iam_role" "github" {
  name = "github-actions"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = "${aws_iam_openid_connect_provider.github.arn}"
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:ceshmina/apkas:*"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "github_dynamodb" {
  role       = aws_iam_role.github.name
  policy_arn = aws_iam_policy.read_dynamodb.arn
}

resource "aws_iam_role_policy_attachment" "github_s3" {
  role       = aws_iam_role.github.name
  policy_arn = aws_iam_policy.sync_s3.arn
}

resource "aws_iam_role_policy_attachment" "github_ecr" {
  role       = aws_iam_role.github.name
  policy_arn = aws_iam_policy.push_ecr.arn
}

resource "aws_iam_role" "admin_auth" {
  name = "admin-auth"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "build.apprunner.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "admin_auth" {
  role       = aws_iam_role.admin_auth.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_iam_role" "admin" {
  name = "admin"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

data "aws_iam_policy_document" "admin_dynamodb" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
    ]
    resources = [
      aws_dynamodb_table.diary.arn,
      "${aws_dynamodb_table.diary.arn}/index/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
    ]
    resources = [
      aws_secretsmanager_secret.admin.arn,
    ]
  }
}

resource "aws_iam_policy" "admin_dynamodb" {
  name   = "admin-dynamodb"
  policy = data.aws_iam_policy_document.admin_dynamodb.json
}

resource "aws_iam_role_policy_attachment" "admin_dynamodb" {
  role       = aws_iam_role.admin.name
  policy_arn = aws_iam_policy.admin_dynamodb.arn
}
