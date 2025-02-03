resource "aws_rds_cluster" "aurora" {
  cluster_identifier   = "${var.name}-aurora"
  engine               = "aurora-postgresql"
  engine_mode          = "provisioned"
  engine_version       = "13.15"
  master_username      = "apkas_admin"
  master_password      = "dummay_password"
  availability_zones   = var.aws_availability_zones
  db_subnet_group_name = aws_db_subnet_group.aurora.name
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

resource "aws_db_subnet_group" "aurora" {
  name = "${var.name}-aurora"
  subnet_ids = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id
  ]
}
