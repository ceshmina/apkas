data "aws_route53_zone" "this" {
  name = var.route53_zone_name
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = aws_apprunner_custom_domain_association.api.domain_name
  type    = "CNAME"
  ttl     = 300
  records = [aws_apprunner_custom_domain_association.api.dns_target]
}

resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for record in aws_apprunner_custom_domain_association.api.certificate_validation_records : record.name => {
      name   = record.name
      record = record.value
    }
  }
  zone_id = data.aws_route53_zone.this.zone_id
  name    = each.value.name
  type    = "CNAME"
  ttl     = "300"
  records = [each.value.record]
}

resource "aws_acm_certificate" "frontend" {
  domain_name       = var.route53_zone_name
  validation_method = "DNS"
  provider          = aws.virginia
}

resource "aws_route53_record" "frontend_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }
  zone_id = data.aws_route53_zone.this.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "frontend" {
  certificate_arn = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [
    for record in aws_route53_record.frontend_cert_validation : record.fqdn
  ]
  provider = aws.virginia
}

resource "aws_route53_record" "frontend" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.route53_zone_name
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}
