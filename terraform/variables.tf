variable "project_name" {
  description = "Project name"
  type        = string
  default     = "apkas"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "is_localstack" {
  description = "Whether to use LocalStack endpoints"
  type        = bool
  default     = true
}

variable "aws_profile" {
  description = "AWS profile for SSO (only used when not using LocalStack)"
  type        = string
  default     = null
}
