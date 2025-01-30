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
