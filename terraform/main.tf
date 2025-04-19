terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Network Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "${var.project_name}-vpc"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway = true
  single_nat_gateway = var.environment == "production" ? false : true

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"

  cluster_name    = "${var.project_name}-cluster"
  cluster_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    main = {
      desired_size = var.environment == "production" ? 3 : 1
      min_size     = var.environment == "production" ? 2 : 1
      max_size     = var.environment == "production" ? 5 : 2

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# RDS Database
module "rds" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "${var.project_name}-db"

  engine            = "postgres"
  engine_version    = "14"
  instance_class    = var.environment == "production" ? "db.t3.large" : "db.t3.micro"
  allocated_storage = var.environment == "production" ? 100 : 20

  db_name  = "analytics"
  username = "admin"
  port     = "5432"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  maintenance_window = "Mon:00:00-Mon:03:00"
  backup_window      = "03:00-06:00"

  backup_retention_period = 7

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# ElastiCache Redis
module "elasticache" {
  source = "terraform-aws-modules/elasticache/aws"

  cluster_id           = "${var.project_name}-redis"
  engine              = "redis"
  engine_version      = "6.x"
  node_type           = var.environment == "production" ? "cache.t3.micro" : "cache.t3.micro"
  num_cache_nodes     = var.environment == "production" ? 2 : 1
  parameter_group_family = "redis6"
  port                = 6379

  subnet_ids = module.vpc.private_subnets

  security_group_rules = {
    ingress_redis = {
      type        = "ingress"
      from_port   = 6379
      to_port     = 6379
      protocol    = "tcp"
      cidr_blocks = [module.vpc.vpc_cidr_block]
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# S3 Bucket for backups
resource "aws_s3_bucket" "backups" {
  bucket = "${var.project_name}-backups-${var.environment}"

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "cleanup"
    status = "Enabled"

    expiration {
      days = 30
    }
  }
}

# CloudFront CDN
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = [var.domain_name]

  origin {
    domain_name = aws_s3_bucket.backups.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.backups.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.cdn.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.backups.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress              = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cdn.arn
    ssl_support_method  = "sni-only"
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# ACM Certificate for CDN
resource "aws_acm_certificate" "cdn" {
  provider = aws.us-east-1

  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Route53 DNS
resource "aws_route53_zone" "main" {
  name = var.domain_name
}

resource "aws_route53_record" "cdn" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id               = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}
