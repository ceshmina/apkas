provider "aws" {
  region = "ap-northeast-1"
}

provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

module "apkas" {
  source = "../../modules/apkas"

  providers = {
    aws.virginia = aws.virginia
  }

  env            = "production"
  domain         = "apkas.net"
  tfstate_bucket = "apkas-production-terraform"
}
