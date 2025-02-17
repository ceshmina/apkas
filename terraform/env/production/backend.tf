terraform {
  backend "s3" {
    bucket = "apkas-production-terraform"
    key    = "apkas-production.tfstate"
    region = "ap-northeast-1"
  }
}
