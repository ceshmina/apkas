terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# LocalStack provider configuration
provider "aws" {
  alias = "localstack"
  
  region                      = var.region
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    s3       = "http://localhost:4566"
    lambda   = "http://localhost:4566"
    dynamodb = "http://localhost:4566"
    iam      = "http://localhost:4566"
  }
}

# Real AWS provider configuration (uses SSO)
provider "aws" {
  alias   = "real"
  region  = var.region
  profile = var.aws_profile
}

# Default provider based on is_localstack variable
provider "aws" {
  region  = var.region
  profile = var.is_localstack ? null : var.aws_profile
  
  # LocalStack specific settings (only applied when is_localstack = true)
  access_key                  = var.is_localstack ? "test" : null
  secret_key                  = var.is_localstack ? "test" : null
  skip_credentials_validation = var.is_localstack
  skip_metadata_api_check     = var.is_localstack
  skip_requesting_account_id  = var.is_localstack
  s3_use_path_style           = var.is_localstack

  dynamic "endpoints" {
    for_each = var.is_localstack ? [1] : []
    content {
      s3       = "http://localhost:4566"
      lambda   = "http://localhost:4566"
      dynamodb = "http://localhost:4566"
      iam      = "http://localhost:4566"
    }
  }
}
