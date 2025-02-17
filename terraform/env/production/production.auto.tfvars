name = "apkas-production"

route53_zone_name = "apkas.net"

api_apprunner_max_concurrency = 100
api_apprunner_max_size        = 1
api_apprunner_min_size        = 1

aurora_max_size                 = 1
aurora_min_size                 = 0
aurora_seconds_until_auto_pause = 300
