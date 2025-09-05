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
      "dynamodb:GetItem",
    ]
    resources = [
      aws_dynamodb_table.diary.arn,
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
