terraform {
  backend "s3" {
    bucket = "apkas-staging-terraform"
    key    = "apkas-staging.tfstate"
    region = "ap-northeast-1"
  }
}
