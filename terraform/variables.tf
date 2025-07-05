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
