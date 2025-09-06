terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 6.10.0"
    }
  }

  backend "s3" {
    bucket = "apkas-production-terraform"
    key    = "apkas.tfstate"
    region = "ap-northeast-1"
  }
}
