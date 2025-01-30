resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

data "aws_iam_policy_document" "github_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:ceshmina/apkas:*"]
    }
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
  }
}

data "aws_iam_policy_document" "github_policy" {
  statement {
    sid       = "ForLoginToECR"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid = "ForPushImageToECR"
    actions = [
      "ecr:CompleteLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:InitiateLayerUpload",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:BatchGetImage"
    ]
    resources = [aws_ecr_repository.api.arn]
  }
}

resource "aws_iam_role" "github" {
  name               = "github-actions-api"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
}

resource "aws_iam_role_policy" "github" {
  name   = "github-actions-api"
  role   = aws_iam_role.github.name
  policy = data.aws_iam_policy_document.github_policy.json
}
