provider "aws" {
  region = "ap-northeast-1"
}

module "apkas" {
  source = "../../modules/apkas"
}
