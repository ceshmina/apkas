variable "name" {
  type     = string
  nullable = false
}

variable "aws_region" {
  type    = string
  default = "ap-northeast-1"
}

variable "route53_zone_name" {
  type    = string
  default = "apkas.net"
}

variable "api_ecr_repository_name" {
  type    = string
  default = "api"
}

variable "api_apprunner_service_name" {
  type    = string
  default = "apkas-api"
  validation {
    condition     = length(var.api_apprunner_service_name) >= 4
    error_message = "The name must have at least 4 characters."
  }
}

variable "api_apprunner_max_concurrency" {
  type    = number
  default = 100
}

variable "api_apprunner_max_size" {
  type    = number
  default = 1
}

variable "api_apprunner_min_size" {
  type    = number
  default = 1
}
