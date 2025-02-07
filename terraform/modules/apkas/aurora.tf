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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group_rule" "aurora_ingress_self" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  security_group_id        = aws_security_group.aurora.id
  source_security_group_id = aws_security_group.aurora.id
}

resource "aws_security_group_rule" "aurora_ingress_apprunner" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.aurora.id
  source_security_group_id = aws_security_group.apprunner.id
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

resource "random_password" "aurora_user" {
  length  = 16
  special = true
}

resource "aws_secretsmanager_secret" "aurora_user" {
  name = "${var.name}-aurora-user"
}

resource "aws_secretsmanager_secret_version" "aurora_user_value" {
  secret_id = aws_secretsmanager_secret.aurora_user.id
  secret_string = jsonencode({
    username = "apkas_user"
    password = random_password.aurora_user.result
    engine   = "postgres"
    host     = aws_rds_cluster.aurora.endpoint
    port     = 5432
    dbname   = "apkas"
  })
}
