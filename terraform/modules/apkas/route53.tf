data "aws_route53_zone" "this" {
  name = var.domain
}

resource "aws_route53_record" "frontend_a" {
  zone_id = data.aws_route53_zone.this.zone_id

  name = var.domain
  type = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "frontend_aaaa" {
  zone_id = data.aws_route53_zone.this.zone_id

  name = var.domain
  type = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_acm_certificate" "frontend" {
  provider = aws.virginia

  domain_name       = var.domain
  validation_method = "DNS"
}

resource "aws_route53_record" "frontend_validation" {
  for_each = {
    for x in aws_acm_certificate.frontend.domain_validation_options : x.domain_name => {
      name   = x.resource_record_name
      record = x.resource_record_value
      type   = x.resource_record_type
    }
  }

  zone_id = data.aws_route53_zone.this.zone_id
  ttl     = 60
  name    = each.value.name
  records = [each.value.record]
  type    = each.value.type
}

resource "aws_acm_certificate_validation" "frontend" {
  provider = aws.virginia

  certificate_arn         = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [for record in aws_route53_record.frontend_validation : record.fqdn]
}

resource "aws_route53_record" "admin_a" {
  zone_id = data.aws_route53_zone.this.zone_id

  name = "admin.${var.domain}"
  type = "A"

  alias {
    name                   = aws_apprunner_custom_domain_association.admin.dns_target
    zone_id                = "Z08491812XW6IPYLR6CCA"
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "admin_aaaa" {
  zone_id = data.aws_route53_zone.this.zone_id

  name = "admin.${var.domain}"
  type = "AAAA"

  alias {
    name                   = aws_apprunner_custom_domain_association.admin.dns_target
    zone_id                = "Z08491812XW6IPYLR6CCA"
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "admin_validation" {
  for_each = {
    for x in aws_apprunner_custom_domain_association.admin.certificate_validation_records : x.name => {
      name   = x.name
      record = x.value
      type   = x.type
    }
  }

  zone_id = data.aws_route53_zone.this.zone_id
  ttl     = 60
  name    = each.value.name
  records = [each.value.record]
  type    = each.value.type
}
