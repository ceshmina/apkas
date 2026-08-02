locals {
  environment = "production"
}

module "delivery" {
  source = "../../modules/delivery"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  environment    = local.environment
  aws_account_id = var.aws_account_id

  # ドメイン名は DNS を引けば分かる公開情報であり、隠す必要がない。
  # environment と同じくこの環境を定義づける値なので、ここに直接書く。
  #
  # ポートフォリオはゾーンの頂点で配信する。apkas.net のゾーンには
  # メールの MX や日記サイト（diary.apkas.net）のレコードが同居するため、
  # モジュールはゾーンを data で参照し、このサイトのレコードだけを作る。
  domain_name      = "apkas.net"
  hosted_zone_name = "apkas.net"
}
