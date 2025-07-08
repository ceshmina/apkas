resource "aws_lambda_layer_version" "exiftool" {
  filename         = "../lambda/layer/exiftool-layer.zip"
  layer_name       = "${var.project_name}-${var.environment}-exiftool"
  source_code_hash = filebase64sha256("../lambda/layer/exiftool-layer.zip")

  compatible_runtimes = ["python3.11"]
  description         = "ExifTool binary and pyexiftool library for image metadata extraction"
}
