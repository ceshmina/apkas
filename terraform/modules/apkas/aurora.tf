resource "aws_db_subnet_group" "aurora" {
  name = "${var.name}-aurora"
  subnet_ids = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id
  ]
}

resource "aws_security_group" "aurora" {
  name   = "${var.name}-aurora"
  vpc_id = aws_vpc.this.id
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier          = "${var.name}-aurora"
  engine                      = "aurora-postgresql"
  engine_mode                 = "provisioned"
  engine_version              = "16.6"
  master_username             = "apkas_admin"
  manage_master_user_password = true
  availability_zones          = var.aws_availability_zones
  db_subnet_group_name        = aws_db_subnet_group.aurora.name
  vpc_security_group_ids      = [aws_security_group.aurora.id]
  enable_http_endpoint        = true
  serverlessv2_scaling_configuration {
    max_capacity             = var.aurora_max_size
    min_capacity             = var.aurora_min_size
    seconds_until_auto_pause = var.aurora_seconds_until_auto_pause
  }
  apply_immediately = true
  lifecycle {
    ignore_changes = [
      availability_zones
    ]
  }
}

resource "aws_rds_cluster_instance" "aurora" {
  cluster_identifier = aws_rds_cluster.aurora.id
  identifier         = "${aws_rds_cluster.aurora.id}-instance"
  instance_class     = "db.serverless"
  engine             = "aurora-postgresql"
  availability_zone  = var.aws_availability_zones[0]
  apply_immediately  = true
}
