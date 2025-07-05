output "original_photos_bucket_name" {
  description = "Name of the original photos S3 bucket"
  value       = aws_s3_bucket.original_photos.bucket
}

output "resized_photos_bucket_name" {
  description = "Name of the resized photos S3 bucket"
  value       = aws_s3_bucket.resized_photos.bucket
}

output "original_photos_bucket_arn" {
  description = "ARN of the original photos S3 bucket"
  value       = aws_s3_bucket.original_photos.arn
}

output "resized_photos_bucket_arn" {
  description = "ARN of the resized photos S3 bucket"
  value       = aws_s3_bucket.resized_photos.arn
}
