variable "name" {
  type = string
}

variable "aws_availability_zones" {
  type = list(string)
}

variable "route53_zone_name" {
  type = string
}

variable "api_ecr_repository_name" {
  type = string
}

variable "api_apprunner_service_name" {
  type = string
}

variable "api_apprunner_max_concurrency" {
  type = number
}

variable "api_apprunner_max_size" {
  type = number
}

variable "api_apprunner_min_size" {
  type = number
}

variable "aurora_max_size" {
  type = number
}

variable "aurora_min_size" {
  type = number
}

variable "aurora_seconds_until_auto_pause" {
  type = number
}
